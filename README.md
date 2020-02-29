# K8Dash - Kubernetes Dashboard

K8Dash is the easiest way to manage your Kubernetes cluster. Why?
* Full cluster management: Namespaces, Nodes, Pods, Replica Sets, Deployments, Storage, RBAC and more
* Blazing fast and Always Live: no need to refresh pages to see the latest
* Quickly visualize cluster health at a glance: Real time charts help quickly track down poorly performing resources
* Easy CRUD and scaling: plus inline API docs to easily understand what each field does
* Simple OpenID integration: no special proxies required
* Simple installation: use the provided yaml resources to have K8Dash up and running in under 1 minute (no, seriously)


## Click the video below to see K8Dash in action
[![K8Dash - Kubernetes Dashboard](https://raw.githubusercontent.com/herbrandson/k8dash/master/docs/videoThumbnail.png)](http://www.youtube.com/watch?v=u-1jGAhAHAM "K8Dash - Kubernetes Dashboard")


## Prerequisites
+ A running Kubernetes cluster
+ [metrics server](https://github.com/kubernetes-incubator/metrics-server) installed (optional, but strongly recommended)
+ A Kubernetes cluster configured for [OpenId Connect](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens) authentication (optional)

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

# kubectl proxy
Unfortunately, `kubectl proxy` can not be used to access k8dash. According to the information at [https://github.com/kubernetes/kubernetes/issues/38775#issuecomment-277915961](https://github.com/kubernetes/kubernetes/issues/38775#issuecomment-277915961), it seems that `kubectl proxy` strips the Authorization header when it proxies requests. From that link:

> this is working as expected. "proxying" through the apiserver will not get you standard proxy behavior (preserving Authorization headers end-to-end), because the API is not being used as a standard proxy



# Logging in
There are multiple options logging into the dashboard.

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

## Running k8dash with OpenId Connect (oidc)
K8dash makes using OpenId Connect for authentication easy. Assuming your cluster is configured to use OIDC, all you need to do is create a secret containing your credentials and run the [kubernetes-k8dash-oidc.yaml](https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash-oidc.yaml) config.

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

The other option is `OIDC_METADATA`. K8Dash uses the excellent [node-openid-client](https://github.com/panva/node-openid-client) module. `OIDC_METADATA` will take a json string and pass it to the `Client` constructor. Docs [here](https://github.com/panva/node-openid-client/blob/master/docs/README.md#client). For example, `OIDC_METADATA='{"token_endpoint_auth_method":"client_secret_post"}`

## Running k8dash with NodePort
If you do not have an ingress server setup, you can utilize a NodePort service as configured in the [kubernetes-k8dash-nodeport.yaml](https://raw.githubusercontent.com/herbrandson/k8dash/master/kubernetes-k8dash-nodeport.yaml). This is ideal when creating a single node master, or if you want to get up and running as fast as possible.

This will map the k8dash port 4654 to a randomly selected port on the running node. The assigned port can be found using
```
$ kubectl get svc --namespace=kube-system

NAME       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
k8dash     NodePort    10.107.107.62   <none>        4654:32565/TCP   1m
```

## Metrics
K8dash relies heavily on [metrics-server](https://github.com/kubernetes-incubator/metrics-server) to display real time cluster metrics. It is strongly recommended to have metrics-server installed to get the best experiance from k8dash.

+ [Installing metrics-server](https://github.com/kubernetes-incubator/metrics-server)
+ [Running metrics-server with kubeadm](https://medium.com/@waleedkhan91/how-to-configure-metrics-server-on-kubeadm-provisioned-kubernetes-cluster-f755a2ac43a2)


# Development
K8dash is made up of 2 parts. The server and the client.

### Server
To run the server, run `npm i` from the `/server` directory to install dependencies and then `npm start` to run the server.
The server is a simple express.js server that is primarily responsible for proxying requests to the Kubernetes api server.
During development, the server will use whatever is configured in `~/.kube/config` to connect the desired cluster.

### Client
For the client, move to the `/client` directory, run `npm i` and then `npm start`. The client is a React application with minimal other dependencies.

## License

[Apache License 2.0](https://raw.githubusercontent.com/herbrandson/k8dash/master/LICENSE)