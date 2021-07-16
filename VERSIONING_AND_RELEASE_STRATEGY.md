# Versioning and Release Strategy - Status: Proposed
## Table of Contents
- **[Versioning Strategy](#versioning-strategy)**<br>
- **[Release Strategy](#release-strategy)**<br>
- **[Contribution Workflow](#contribution-workflow)**<br>
- **[Breaking Changes Guide](#breaking-changes-guide)**<br>

## Versioning Strategy
Once Skooner version v1.0.0 is released, subsequent releases will follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Until then, breaking changes may occur without an uptick to the Major version.

Versions will use the `v<semantic version>` tag pattern.

## Release Strategy
### Major Release
**Method**:
1. Release current content in Stable branch as a Minor/Patch release
2. Replace Stable branch content with everything from Main branch
3. Release updated Stable branch as a Major release

### Minor/Patch Release
**Method**: Release Stable branch as a Minor/Patch release

### Strategy Reasoning
- To support agile feature additions at a regular pace, users of Skooner can expect Stable updates on each Major version before
needing to review any breaking changes. Users can simply subscribe to a particular Major version and pull the latest
changes for that version without worry.
- If users want to be on the cutting edge, they have the option of subscribing to the latest changes on the Main branch.
- Helpful when needing to perform security patches for previous Major releases, fewer Major releases means less work.

## Contribution Workflow
1. Contributor: [Fork](https://gist.github.com/Chaser324/ce0505fbed06b947d962#creating-a-fork) from Main
2. Contributor: [Develop in your Fork](https://gist.github.com/Chaser324/ce0505fbed06b947d962#doing-your-work)
3. Contributor: [Prep PR by cleaning up your work and merging updates from the upstream repo](https://gist.github.com/Chaser324/ce0505fbed06b947d962#cleaning-up-your-work)
4. Contributor: [Submit PR](https://gist.github.com/Chaser324/ce0505fbed06b947d962#submitting) against Main
5. Maintainer: Perform a code review and identify potential breaking changes
   1. If there are [breaking changes](#breaking-changes-guide), the PR might not be merged until the following [Major Release](#major-release)
   2. However, if backwards compatibility can be added to the change, attempt to remediate the breaking change before completing the merge to Main
   3. This project typically doesn't have breaking changes, so ideally this is rare
6. Maintainer: If the change is not a breaking change, merge to Stable
7. Additional steps may be added in the future

## Breaking Changes Guide
### In General, removing/changing any particular interface in a non-additive way
In general, if logic exists that interfaces with anything outside of Skooner (including user interfaces), removing that logic or changing the contract is likely
considered a breaking change.  Adding content/features to a user interface is additive and not a breaking change, unless it results
in a major negative performance impact.

The rest of this section will go into more detailed examples of breaking changes.

#### Dropping Support for a K8s Cluster Version
Reasons this might happen:
- Adding a feature that only works on newer K8s clusters and not having a feature switch that would allow for the new
feature to go dark on older cluster versions, maintaining the functionality that was present before the feature add.
- Removing any logic that is needed to support a particular K8s cluster version

#### Dropping Support for a CRD or Version of a CRD
HPA for example:
- If HPA support is removed
- Logic is added to scrape the new HPA CRD fields provided in K8s 1.18 and isn't able to continue supporting the
limited information from 1.17.

#### Browser Support
Browser support is an important interface because companies often leverage a single browser for all needs and sometimes
they get locked into old versions for a variety of reasons.  The following are examples of breaking changes:
- Removing support for a browser type (Mozilla, Chrome, etc)
- Removing support for a browser version
- Adding a feature that won't work on an older browser, such as the deprecations mentioned above

#### OpenId Connect Support
Deprecation of a previously supported version of [OpenId Connect](https://github.com/skooner-k8s/skooner#oidc)

#### Metrics-Server Support
Deprecation of a previously supported version of [metrics-server](https://github.com/skooner-k8s/skooner#metrics)

#### Noteworthy Performance Changes
Changes in the minimum resource requirements for the deployment, due to a feature change.  This can be hard to identify,
but ideally is considered in obvious cases.

A new feature might be more CPU intensive or require caching that increases memory requirements.  Without this new
minimum, Skooner might crash. Consider the following:

- How might the requested change impact the performance of pulling or presenting a list of N items on large and active clusters?
   - Pulling a large dataset (even for a few items), depending on the auto-refresh frequency and use frequency,
could cause congestion, even on a small cluster
- Any added caching might increase the minimum memory consumption

