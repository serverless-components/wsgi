const path = require("path");
const fse = require("fs-extra");
const { Component } = require("@serverless/core");
const tempy = require("tempy");

class Wsgi extends Component {
  async default({ code, app, env, dockerizePip, requirements } = {}) {
    const lambda = await this.load("@serverless/aws-lambda");
    const pythonLayer = await this.load("@serverless/python-requirements-layer");
    const apiGateway = await this.load("@serverless/aws-api-gateway");

    this.context.status(`Deploying WSGI app ${app}`);

    const slsWsgiConfigPath = path.join(tempy.directory(), ".serverless-wsgi");
    await fse.writeFile(slsWsgiConfigPath, JSON.stringify({ app }));

    let layerOutputs
    if (requirements || await fse.exists('requirements.txt')) {
      layerOutputs = await pythonLayer({ dockerizePip, requirements: requirements || 'requirements.txt' });
    }
    const lambdaOutputs = await lambda({
      code,
      env,
      layer: layerOutputs,
      name: "serverless-wsgi",
      handler: "wsgi_handler.handler",
      shims: [
        path.join(__dirname, "wsgi_handler.py"),
        path.join(__dirname, "serverless_wsgi.py"),
        slsWsgiConfigPath
      ],
      runtime: "python3.7",
      description: "Lambda for processing alerts from the Serverless Dashboard"
    });

    const apiGatewayOutputs = await apiGateway({
      description: "Serverless WSGI API",
      endpoints: [
        {
          path: "/",
          method: "ANY",
          function: lambdaOutputs.arn
        },
        {
          path: "{proxy+}",
          method: "ANY",
          function: lambdaOutputs.arn
        }
      ]
    });

    return { url: apiGatewayOutputs.url };
  }

  async remove() {
    const lambda = await this.load("@serverless/aws-lambda");
    const apiGateway = await this.load("@serverless/aws-api-gateway");

    this.context.status(`Removing WSGI app`);

    await apiGateway.remove();
    await lambda.remove();
  }
}

module.exports = Wsgi;
