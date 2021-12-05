import axios from "axios";

const baseURL = "http://127.0.0.1:8000/api/";

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  headers: {
    Authorization: localStorage.getItem("access_token")
      ? "JWT " + localStorage.getItem("access_token")
      : null,
    accept: "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
	console.log(error.config)
    if (typeof error.response === "undefined") {
      alert(
        "A server/network error occurred. " +
          "Looks like CORS might be the problem. " +
          "Sorry about this - we will get it fixed shortly."
      );
      return Promise.reject(error);
    }
	// console.log(originalRequest.url);
    if (
      error.response.status === 401 &&
      originalRequest.url === "auth/jwt/refresh/"
    ) {
      window.location.href = "/login/";
	  localStorage.removeItem("access_token")
	  localStorage.removeItem("refresh_token")
      return Promise.reject(error);
    }

    if (
      error.response.data.code === "token_not_valid" &&
      error.response.status === 401 &&
      error.response.statusText === "Unauthorized"
    ) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        const tokenParts = JSON.parse(atob(refreshToken.split(".")[1]));

        // exp date in token is expressed in seconds, while now() returns milliseconds:
        const now = Math.ceil(Date.now() / 1000);
        console.log(tokenParts.exp);

        if (tokenParts.exp > now) {
          return axiosInstance
            .post("auth/jwt/refresh/", { refresh: refreshToken })
            .then((response) => {
              localStorage.setItem("access_token", response.data.access);
			console.log("new:    ",localStorage.getItem("access_token"))
              axiosInstance.defaults.headers["Authorization"] =
                "JWT " + response.data.access;
              originalRequest.headers["Authorization"] =
                "JWT " + response.data.access;
				if ( originalRequest.url === "auth/jwt/verify") {
					originalRequest.data["token"] = localStorage.getItem("access_token")
					console.log(originalRequest)
				}
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
				console.log("%%%%%%%%%%%%%%%%%%%%%%%%%")
			  	// localStorage.removeItem("access_token");
				// localStorage.removeItem("refresh_token");
				// axiosInstance.defaults.headers['Authorization'] = null;
				// window.location.href = "/login/";
            });
        } else {
          console.log("Refresh token is expired", tokenParts.exp, now);
		  axiosInstance.defaults.headers['Authorization'] = null;
		  localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
          window.location.href = "/login/";
        }
      } else {
        console.log("Refresh token not available.");
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		axiosInstance.defaults.headers['Authorization'] = null;
        window.location.href = "/login/";
      }
    }

    // specific error handling done elsewhere
    return Promise.reject(error);
  }
);

export default axiosInstance;