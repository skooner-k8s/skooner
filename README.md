# k8dash - Kubernetes Dashboard

k8dash is the easiest way to manage your Kubernetes cluster. Why?
* Full cluster management: Namespaces, Nodes, Pods, Replica Sets, Deployments, Storage, RBAC and more
* Blazing fast and Always Live: no need to refresh pages to see the latest
* Quickly visualize cluster health at a glance: Real time charts help quickly track down poorly performing resources
* Easy CRUD and scaling: plus inline API docs to easily understand what each field does
* 100% responsive (runs on your phone/tablet)
* Simple OpenID integration: no special proxies required
* Simple installation: use the provided yaml resources to have k8dash up and running in under 1 minute (no, seriously)


## Click the video below to see k8dash in action
[![k8dash - Kubernetes Dashboard](https://raw.githubusercontent.com/herbrandson/k8dash/master/docs/videoThumbnail.png)](http://www.youtube.com/watch?v=u-1jGAhAHAM "k8dash - Kubernetes Dashboard")

<a name="table_of_content"></a>
# Table of Contents

- [Prerequisites](#Prerequisites)  
- [Getting Started](#Getting_started)  
- [Kubectl proxy](#kubectl_proxy)  
- [Logging in](#Logging_in)  
    - [Service Account Token](#Service_Account_Token)
    - [Running k8dash with OpenId Connect (oidc)](#oidc)
    - [Running k8dash with NodePort](#Nodeport)
    - [Metrics](#Metrics)
- [Development](#Development)
    - [Prerequisites](#Prerequisites)
- [k8dash is made up of 2 parts. The server and the client](#Parts_of_k8dash)
    - [Server](#Server)
    - [Client](#Client)
- [License](#License)    
  


<a name="Prerequisites"></a>
## Prerequisites
+ A running Kubernetes cluster (e.g., [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/))
+ [metrics server](https://github.com/kubernetes-incubator/metrics-server) installed (optional, but strongly recommended)
+ A Kubernetes cluster configured for [OpenId Connect](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens) authentication (optional)

back to [Table of Content](#table_of_content)

<a name="Getting_started"></a>
## Getting Started
Deploy k8dash with something like the following...

NOTE: never trust a file downloaded from the internet. Make sure to review the contents of [kubernetes-k8dash.yaml](https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash.yaml) before running the script below.

``` bash
kubectl apply -f https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash.yaml
```

To access k8dash, you must make it publicly visible. If you have an ingress server setup, you can accomplish by adding a route like the following


``` yaml
kind: Ingress
apiVersion: extensions/v1beta1
metadata:
  name: k8dash
  namespace: kube-system
spec:
  rules:
  -
    host: k8dash.example.com
    http:
      paths:
      -
        path: /
        backend:
          serviceName: k8dash
          servicePort: 80
```

back to [Table of Content](#table_of_content)

<a name="kubectl_proxy"></a>
# kubectl proxy
Unfortunately, `kubectl proxy` can not be used to access k8dash. According to the information at [https://github.com/kubernetes/kubernetes/issues/38775#issuecomment-277915961](https://github.com/kubernetes/kubernetes/issues/38775#issuecomment-277915961), it seems that `kubectl proxy` strips the Authorization header when it proxies requests. From that link:

> this is working as expected. "proxying" through the apiserver will not get you standard proxy behavior (preserving Authorization headers end-to-end), because the API is not being used as a standard proxy

back to [Table of Content](#table_of_content)

<a name="Logging_in"></a>
# Logging in
There are multiple options logging into the dashboard.

<a name="Service_Account_Token"></a>
## Service Account Token
The first (and easiest) option is to create a dedicated service account. The can be accomplished using the following script.

``` bash
# Create the service account in the current namespace (we assume default)
kubectl create serviceaccount k8dash-sa

# Give that service account root on the cluster
kubectl create clusterrolebinding k8dash-sa --clusterrole=cluster-admin --serviceaccount=default:k8dash-sa

# Find the secret that was created to hold the token for the SA
kubectl get secrets

# Show the contents of the secret to extract the token
kubectl describe secret k8dash-sa-token-xxxxx

```

Retrieve the `token` value from the secret and enter it into the login screen to access the dashboard.

back to [Table of Content](#table_of_content)

<a name="oidc"></a>
## Running k8dash with OpenId Connect (oidc)
k8dash makes using OpenId Connect for authentication easy. Assuming your cluster is configured to use OIDC, all you need to do is create a secret containing your credentials and run the [kubernetes-k8dash-oidc.yaml](https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash-oidc.yaml) config.

To learn more about configuring a cluster for OIDC, check out these great links
+ [https://kubernetes.io/docs/reference/access-authn-authz/authentication/](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens)
+ [https://medium.com/@mrbobbytables/kubernetes-day-2-operations-authn-authz-with-oidc-and-a-little-help-from-keycloak-de4ea1bdbbe](https://medium.com/@mrbobbytables/kubernetes-day-2-operations-authn-authz-with-oidc-and-a-little-help-from-keycloak-de4ea1bdbbe)
+ [https://medium.com/@int128/kubectl-with-openid-connect-43120b451672](https://medium.com/@int128/kubectl-with-openid-connect-43120b451672)
+ [https://www.google.com/search?q=kubernetes+configure+oidc&oq=kubernetes+configure+oidc&aqs=chrome..69i57j0.4772j0j7&sourceid=chrome&ie=UTF-8](https://www.google.com/search?q=kubernetes+configure+oidc&oq=kubernetes+configure+oidc&aqs=chrome..69i57j0.4772j0j7&sourceid=chrome&ie=UTF-8)

You can deploy k8dash with oidc support using something like the following script...

NOTE: never trust a file downloaded from the internet. Make sure to review the contents of [kubernetes-k8dash-oidc.yaml](https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash-oidc.yaml) before running the script below.

``` bash
OIDC_URL=<put your endpoint url here... something like https://accounts.google.com>
OIDC_ID=<put your id here... something like blah-blah-blah.apps.googleusercontent.com>
OIDC_SECRET=<put your oidc secret here>

kubectl create secret -n kube-system generic k8dash \
--from-literal=url="$OIDC_URL" \
--from-literal=id="$OIDC_ID" \
--from-literal=secret="$OIDC_SECRET"

kubectl apply -f https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash-oidc.yaml

```

Additionally, there are a few other OIDC options you can provide via environment variables. First is `OIDC_SCOPES`. The default value for this value is `openid email`, but additional scopes can also be added using something like `OIDC_SCOPES="openid email groups"`.

The other option is `OIDC_METADATA`. k8dash uses the excellent [node-openid-client](https://github.com/panva/node-openid-client) module. `OIDC_METADATA` will take a json string and pass it to the `Client` constructor. Docs [here](https://github.com/panva/node-openid-client/blob/master/docs/README.md#client). For example, `OIDC_METADATA='{"token_endpoint_auth_method":"client_secret_post"}`

back to [Table of Content](#table_of_content)

<a name="Nodeport"></a>
## Running k8dash with NodePort
If you do not have an ingress server setup, you can utilize a NodePort service as configured in the [kubernetes-k8dash-nodeport.yaml](https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash-nodeport.yaml). This is ideal when creating a single node master, or if you want to get up and running as fast as possible.

This will map the k8dash port 4654 to a randomly selected port on the running node. The assigned port can be found using
```
$ kubectl get svc --namespace=kube-system

NAME       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
k8dash     NodePort    10.107.107.62   <none>        4654:32565/TCP   1m
```

back to [Table of Content](#table_of_content)

<a name="Metrics"></a>
## Metrics
k8dash relies heavily on [metrics-server](https://github.com/kubernetes-incubator/metrics-server) to display real time cluster metrics. It is strongly recommended to have metrics-server installed to get the best experiance from k8dash.

+ [Installing metrics-server](https://github.com/kubernetes-incubator/metrics-server)
+ [Running metrics-server with kubeadm](https://medium.com/@waleedkhan91/how-to-configure-metrics-server-on-kubeadm-provisioned-kubernetes-cluster-f755a2ac43a2)


back to [Table of Content](#table_of_content)

<a name="Development"></a>
# Development

<a name="Prerequisites"></a>
## Prerequisites:
+ A running Kubernetes cluster.
Installing and running [minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) is an easy way to get this.
Once minikube is installed, you can run it with the command `minikube start --driver=docker`
+ Once the cluster is up and running, create some login credentials as described [above](https://github.com/indeedeng/k8dash#logging-in)

back to [Table of Content](#table_of_content)

<a name="Parts_of_k8dash"></a>
## k8dash is made up of 2 parts. The server and the client.

<a name="Server"></a>
### Server
To run the server, run `npm i` from the `/server` directory to install dependencies and then `npm start` to run the server.
The server is a simple express.js server that is primarily responsible for proxying requests to the Kubernetes api server.

During development, the server will use whatever is configured in `~/.kube/config` to connect the desired cluster. If you are using minikube, for example, you can run `kubectl config set-context minikube` to get `~/.kube/config` set up correctly.

back to [Table of Content](#table_of_content)

<a name="Client"></a>
### Client
The client is a React application (using TypeScript) with minimal other dependencies.

To run the client, open a new terminal tab and navigate to the `/client` directory, run `npm i` and then `npm start`. This will open up a browser window to your local k8dash dashboard. If everything compiles correctly, it will load the site and then an error message will pop up `Unhandled Rejection (Error): Api request error: Forbidden...`. The error message has an 'X' in the top righthand corner to close that message. After you close it, you should see the UI where you can enter your token.

back to [Table of Content](#table_of_content)

<a name="License"></a>
# License

[Apache License 2.0](https://raw.githubusercontent.com/herbrandson/k8dash/master/LICENSE)


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Findeedeng%2Fk8dash.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Findeedeng%2Fk8dash?ref=badge_large)

You Have scrolled so far, lets go back to [Top](#table_of_content)
