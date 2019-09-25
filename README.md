# wsgi

**This is still in very early stages and these directions don't work yet since
this isn't published to NPM yet**

&nbsp;

A serverless component to deploy a WSGI application

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```console
$ npm install -g serverless
```

### 2. Create

```console
$ mkdir wsgi-project && cd wsgi-project
```

The directory should look something like this:


```
|- serverless.yml
|- requirements.txt
|- src/wsgi.py      # or some other python file containing a WSGI app
|- .env         # your AWS api keys
```

the `.env` file should look like this

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```


### 3. Configure

Configure your `serverless.yml` as follows:

```yml
# serverless.yml

service: wsgi-test

wsgi:
  component: @serverless/wsgi
  inputs:
    code: ./src
    app: wsgi.app  # assuming the WSGI app in the wsgi.py file is named 'app'
    dockerizePip: true  # use docker when running pip to install dependencies
```

### 4. Deploy

```console
$ serverless
```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.

