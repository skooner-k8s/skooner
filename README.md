# k8dash

K8dash is a dashboard for monitoring and managing Kubernetes clusters. It heavily utilizes [metrics server](https://github.com/kubernetes-incubator/metrics-server) to quickly and easily visualize the health of nodes and pods. K8dash also utilizes the streaming apis provided by Kubernetes to update cluster state and metrics in real time. No need to refresh pages to monitor status updates.

Why might you want to use k8dash instead of the default Kubernetes dashboard?
* Streaming updates. No need to refresh pages to see latest status
* Full OpenID integration out-of-the-box. No need to configure an authenticating proxy to sit in front.
* Interates with metrics-server to display realtime metrics

## Workloads View
![Dashboard UI workloads page](https://raw.githubusercontent.com/herbrandson/k8dash/master/docs/workloads.png)

## Realtime streaming of status
Notice how the UI automatically reflects changes to the cluster in realtime after scaling a deployment

![Dashboard UI streaming](https://raw.githubusercontent.com/herbrandson/k8dash/master/docs/k8dash.gif)

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



## Metrics
K8dash relies heavily on [metrics-server](https://github.com/kubernetes-incubator/metrics-server) to display real time cluster metrics. It is strongly recommended to have metrics-server installed to get the best experiance from k8dash.

+ [Installing metrics-server](https://github.com/kubernetes-incubator/metrics-server)
+ [Running metrics-server with kubeadm](https://medium.com/@waleedkhan91/how-to-configure-metrics-server-on-kubeadm-provisioned-kubernetes-cluster-f755a2ac43a2)
