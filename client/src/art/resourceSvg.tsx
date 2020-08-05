import React from 'react';
import ClusterRoleBindingSvg from './clusterRoleBindingSvg';
import ClusterRoleSvg from './clusterRoleSvg';
import ConfigMapSvg from './configMapSvg';
import DaemonSetSvg from './daemonSetSvg';
import DeploymentSvg from './deploymentSvg';
import IngressSvg from './ingressSvg';
import LogoSvg from './logoSvg';
import NamespaceSvg from './namespaceSvg';
import NodeSvg from './nodeSvg';
import PersistentVolumeClaimSvg from './persistentVolumeClaimSvg';
import PersistentVolumesSvg from './persistentVolumeSvg';
import PodSvg from './podSvg';
import ReplicaSetSvg from './replicaSetSvg';
import RoleBindingSvg from './roleBindingSvg';
import RoleSvg from './roleSvg';
import SecretSvg from './secretSvg';
import ServiceAccountSvg from './serviceAccountSvg';
import ServiceSvg from './serviceSvg';
import StatefulSetSvg from './statefulSetSvg';
import StorageClassesSvg from './storageClassSvg';
import UserSvg from './userSvg';

const ResourceSvg = (props: {[key: string]: any}) => {
    switch (props.resource) {
        case 'ClusterRole': return <ClusterRoleSvg {...props} />;
        case 'ClusterRoleBinding': return <ClusterRoleBindingSvg {...props} />;
        case 'ConfigMap': return <ConfigMapSvg {...props} />;
        case 'DaemonSet': return <DaemonSetSvg {...props} />;
        case 'Deployment': return <DeploymentSvg {...props} />;
        case 'Ingress': return <IngressSvg {...props} />;
        case 'Namespace': return <NamespaceSvg {...props} />;
        case 'Node': return <NodeSvg {...props} />;
        case 'PersistentVolume': return <PersistentVolumesSvg {...props} />;
        case 'PersistentVolumeClaim': return <PersistentVolumeClaimSvg {...props} />;
        case 'Pod': return <PodSvg {...props} />;
        case 'ReplicaSet': return <ReplicaSetSvg {...props} />;
        case 'Role': return <RoleSvg {...props} />;
        case 'RoleBinding': return <RoleBindingSvg {...props} />;
        case 'Secret': return <SecretSvg {...props} />;
        case 'Service': return <ServiceSvg {...props} />;
        case 'ServiceAccount': return <ServiceAccountSvg {...props} />;
        case 'StatefulSet': return <StatefulSetSvg {...props} />;
        case 'StorageClass': return <StorageClassesSvg {...props} />;
        case 'User': return <UserSvg {...props} />;
        default: return <LogoSvg {...props} />;
    }
};

export default ResourceSvg;
