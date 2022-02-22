# Skooner - Kubernetes Dashboard

__We are changing our name from k8dash to Skooner! Please bear with us as we update our documentation and codebase to reflect this change. If you previously installed k8dash, you will need to uninstall it from your cluster and install Skooner instead. For most cases this can be done by running the following `kubectl delete deployment,service k8dash`__


Skooner is the easiest way to manage your Kubernetes cluster. Skooner is now a sandbox project of the [Cloud Native Computing Foundation](https://www.cncf.io/sandbox-projects)!

* **Full cluster management**: Namespaces, Nodes, Pods, Replica Sets, Deployments, Storage, RBAC and more
* **Blazing fast and Always Live**: no need to refresh pages to see the latest cluster status
* **Quickly visualize cluster health at a glance**: Real time charts help quickly track down poorly performing resources
* **Easy CRUD and scaling**: plus inline API docs to easily understand what each field does
* **100% responsive** (runs on your phone/tablet)
* **Simple OpenID integration**: no special proxies required
* **Simple installation**: use the provided yaml resources to have skooner up and running in under 1 minute (no, seriously)
* **See Skooner in action**:<br>
    [![Skooner - Kubernetes Dashboard](https://raw.githubusercontent.com/skooner-k8s/skooner/master/docs/videoThumbnail.png)](http://www.youtube.com/watch?v=u-1jGAhAHAM "Skooner - Kubernetes Dashboard")

<br>

## Table of Contents
- [Skooner - Kubernetes Dashboard](#skooner---kubernetes-dashboard)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [kubectl proxy](#kubectl-proxy)
  - [Logging in](#logging-in)
    - [Service Account Token](#service-account-token)
    - [OIDC](#oidc)
    - [NodePort](#nodeport)
    - [Metrics](#metrics)
  - [Development](#development)
  - [Skooner Architecture](#skooner-architecture)
    - [Server](#server)
    - [Client](#client)
  - [License](#license)

## Prerequisites
* A running Kubernetes cluster (e.g., [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)), with...
    * [metrics server](https://github.com/kubernetes-incubator/metrics-server) installed (optional, but strongly recommended)
    * configuration for [OpenId Connect](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens) authentication (optional)

(Back to [Table of Contents](#table-of-contents))

## Getting Started
Deploy Skooner with something like the following...

NOTE: never trust a file downloaded from the internet. Make sure to review the contents of [kubernetes-skooner.yaml](https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner.yaml) before running the script below.

``` bash
kubectl apply -f https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner.yaml
```

To access skooner, you must make it publicly visible. If you have an ingress server setup, you can accomplish by adding a route like the following:


``` yaml
kind: Ingress
apiVersion: extensions/v1beta1
metadata:
  name: skooner
  namespace: kube-system
spec:
  rules:
  -
    host: skooner.example.com
    http:
      paths:
      -
        path: /
        backend:
          serviceName: skooner
          servicePort: 80
```

(Back to [Table of Contents](#table-of-contents))

## kubectl proxy
Unfortunately, `kubectl proxy` cannot be used to access Skooner. According to [this comment](https://github.com/kubernetes/kubernetes/issues/38775#issuecomment-277915961), it seems that `kubectl proxy` strips the Authorization header when it proxies requests.

> this is working as expected. "proxying" through the apiserver will not get you standard proxy behavior (preserving Authorization headers end-to-end), because the API is not being used as a standard proxy

(Back to [Table of Contents](#table-of-contents))

## Logging in
There are multiple options for logging into the dashboard: [Service Account Token](#Service-Account-Token), [OIDC](#oidc), and [NodePort](#Nodeport).

### Service Account Token
The first (and easiest) option is to create a dedicated service account. In the command line:

``` bash
# Create the service account in the current namespace (we assume default)
kubectl create serviceaccount skooner-sa

# Give that service account root on the cluster
kubectl create clusterrolebinding skooner-sa --clusterrole=cluster-admin --serviceaccount=default:skooner-sa

# Find the secret that was created to hold the token for the SA
kubectl get secrets

# Show the contents of the secret to extract the token
kubectl describe secret skooner-sa-token-xxxxx

```

Copy the `token` value from the secret, and enter it into the login screen to access the dashboard.

### OIDC
Skooner makes using OpenId Connect for authentication easy. Assuming your cluster is configured to use OIDC, all you need to do is create a secret containing your credentials and apply [kubernetes-skooner-oidc.yaml](https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner-oidc.yaml).

To learn more about configuring a cluster for OIDC, check out these great links
+ [Authenticating | Kubernetes](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens)
+ [Kubernetes Day 2 Operations: AuthN/AuthZ with OIDC and a Little Help From Keycloak | by Bob Killen | Medium](https://medium.com/@mrbobbytables/kubernetes-day-2-operations-authn-authz-with-oidc-and-a-little-help-from-keycloak-de4ea1bdbbe)
+ [kubectl with OpenID Connect. TL;DR | by Hidetake Iwata | Medium](https://medium.com/@int128/kubectl-with-openid-connect-43120b451672)
+ [kubernetes configure oidc - Google Search](https://www.google.com/search?q=kubernetes+configure+oidc)

You can deploy Skooner with OIDC support using something like the following script...

NOTE: never trust a file downloaded from the internet. Make sure to review the contents of [kubernetes-skooner-oidc.yaml](https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner-oidc.yaml) before running the script below.

``` bash
OIDC_URL=<put your endpoint url here... something like https://accounts.google.com>
OIDC_ID=<put your id here... something like blah-blah-blah.apps.googleusercontent.com>
OIDC_SECRET=<put your oidc secret here>

kubectl create secret -n kube-system generic skooner \
--from-literal=url="$OIDC_URL" \
--from-literal=id="$OIDC_ID" \
--from-literal=secret="$OIDC_SECRET"

kubectl apply -f https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner-oidc.yaml

```

Additionally, you can provide other OIDC options via these environment variables:
* `OIDC_SCOPES`: The default value for this value is `openid email`, but additional scopes can also be added using something like `OIDC_SCOPES="openid email groups"`
* `OIDC_METADATA`: Skooner uses the excellent [node-openid-client](https://github.com/panva/node-openid-client) module. `OIDC_METADATA` will take a JSON string and pass it to the `Client` constructor. Docs [here](https://github.com/panva/node-openid-client/blob/master/docs/README.md#client). For example, `OIDC_METADATA='{"token_endpoint_auth_method":"client_secret_post"}`

### NodePort
If you do not have an ingress server setup, you can utilize a NodePort service as configured in [kubernetes-skooner-nodeport.yaml](https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner-nodeport.yaml). This is ideal when creating a single node master, or if you want to get up and running as fast as possible.

This will map Skooner port `4654` to a randomly selected port on the running node. The assigned port can be found using:

```
$ kubectl get svc --namespace=kube-system

NAME       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
skooner     NodePort    10.107.107.62   <none>        4654:32565/TCP   1m
```

### Metrics
Skooner relies heavily on [metrics-server](https://github.com/kubernetes-incubator/metrics-server) to display real time cluster metrics. It is strongly recommended to have `metrics-server` installed to get the best experience from Skooner.

+ [Installing metrics-server](https://github.com/kubernetes-incubator/metrics-server)
+ [Running metrics-server with kubeadm](https://medium.com/@waleedkhan91/how-to-configure-metrics-server-on-kubeadm-provisioned-kubernetes-cluster-f755a2ac43a2)


(Back to [Table of Contents](#table-of-contents))

## Development
You will need:
* A running Kubernetes cluster
    * Installing and running [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) is an easy way to get this.
    * Once minikube is installed, you can run it with the command `minikube start --driver=docker`
* Once the cluster is up and running, create some login credentials as described [above](#logging-in)

(Back to [Table of Contents](#table-of-contents))

## Skooner Architecture

### Server
To run the server, run `npm i` from the `/server` directory to install dependencies and then `npm start` to run the server.
The server is a simple express.js server that is primarily responsible for proxying requests to the Kubernetes api server.

During development, the server will use whatever is configured in `~/.kube/config` to connect the desired cluster. If you are using minikube, for example, you can run `kubectl config set-context minikube` to get `~/.kube/config` set up correctly.

### Client
The client is a React application (using TypeScript) with minimal other dependencies.

To run the client, open a new terminal tab and navigate to the `/client` directory, run `npm i` and then `npm start`. This will open up a browser window to your local Skooner dashboard. If everything compiles correctly, it will load the site and then an error message will pop up `Unhandled Rejection (Error): Api request error: Forbidden...`. The error message has an 'X' in the top righthand corner to close that message. After you close it, you should see the UI where you can enter your token.

(Back to [Table of Contents](#table-of-contents))


## Troubleshooting
### Recommendation for keycloak configuration:
1.  Set OIDC_URL to keycloak OpenId endpoint configuration page.
    e.g. `OIDC_URL=https://{keycloak_domain}/realms/foo/.well-known/openid-configuration`
    Also set `OIDC_CLIENT_ID` locally with `OIDC_CLIENT_ID={client_id}` (this is the same as `OIDC_ID`)
2. While creating secret, use correct var name and use skooner namespace (by default it's `kube-system`):
```
kubectl create secret generic skooner \
--from-literal=url="$OIDC_URL" \
--from-literal=id="$OIDC_ID" \
--from-literal=secret="$OIDC_SECRET" \
--namespace=kube-system
```
3. following that, redeploy skooner server with
   `kubectl apply -f https://raw.githubusercontent.com/skooner-k8s/skooner/master/kubernetes-skooner-oidc.yaml`

4. Make sure skooner is running by checking `kubectl rollout status deploy/skooner --namespace=kube-system`
   If not, report error with logging in `kubectl describe pod skooner --namespace=kube-system`

5. visit skooner, check if login succeeded
6. If not, please report both client and server error.
   Client error: check browser console and send a screenshot
   Server error: check logs by `kubectl logs deploy/skooner --namespace=kube-system`
   Note that `RequestError: connect ECONNREFUSED` may indicate a configuration issue rather than Skooner's issue.


## License

[Apache License 2.0](https://raw.githubusercontent.com/skooner-k8s/skooner/master/LICENSE)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Findeedeng%2Fk8dash.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Findeedeng%2Fk8dash?ref=badge_large)

(Back to [Table of Contents](#table-of-contents))
