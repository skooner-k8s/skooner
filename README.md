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
