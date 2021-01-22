#!/usr/bin/env bash
pbjs \
-t static-module \
-w commonjs \
-o proto.js \
-p k8s.io \
./k8s.io/metrics/pkg/apis/metrics/v1beta1/generated.proto
./k8s.io/apimachinery/pkg/runtime/generated.proto

pbts -o proto.d.ts proto.js
