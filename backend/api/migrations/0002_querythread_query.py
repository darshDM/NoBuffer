# Generated by Django 3.2.1 on 2021-05-27 17:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='querythread',
            name='query',
            field=models.TextField(null=True),
        ),
    ]