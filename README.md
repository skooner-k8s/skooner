# Skooner "Lite" - Read Only Kubernetes Dashboard

This repository is a simplified & cut down version of [Skooner](https://github.com/skooner-k8s/skooner) that can be deployed as a read only dashboard to provides application developers with limited insight into Kubernetes, without exposing the clusters administrative aspects.

# Changes: 
- Removed Login code
- Removed OIDC code
- Removed all Edit, Save, Delete & Exec buttons in the UI
- Removed Routes, Menu items & Views for ClusterRoles & Bindings, ConfigMaps, PersistenVolumes & Claims, ServiceAccounts & Secrets 
- Hardcode login token to be ServiceAccount token injected into pod
- Added json endpoint to expose specific configured environment variables to front end application
- Added ability to limit the visible namespaces based on a ',' seperated list of strings, (filtering is done with '.endsWith()')
- Added made Ingress Hosts clickable (by hardcoding https) 
- Fixed Ingress view broken by api change

## Container image:
Builds of this version of the application can be found at:  

https://hub.docker.com/repository/docker/henrikdk/skooner-lite

# Installation
Easiest way to install is to use the helm chart to deploy application in 'ReadOnly' mode, this will ensure that the application is provided with the correct environment values, cluster role binding and service account to access cluster state in the correct way.

[Helm](https://helm.sh) must be installed.

1. Add the repo:

```
helm repo add henrikdk https://henrikdk.github.io/helm-charts/
```

2. List the charts.
```
helm search repo henrikdk
```

3. View the configuration
```
helm show values henrikdk/skooner-lite
```

4. Save the value into a yaml file and modify values (name, ingress, and namespace filter are minimum requirements) to fit your cluster.

5. Install using helm
```
helm install <name> henrikdk/skooner-lite -f values.yaml
```

# Disclaimer
This app is provided as is with no warranty, I needed this for a project and saw alot of other people requesting something similar so thought I might share it back.