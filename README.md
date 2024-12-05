# PktFlowVis: Visual Analytics for Network Packet Capture Files

## Live Demo
[![Netlify Status](https://api.netlify.com/api/v1/badges/e59ce2f7-877e-48dc-8bb0-36edab75cbdc/deploy-status)](https://app.netlify.com/sites/pktflowvis/deploys)

A live demo is available at <https://pktflowvis.netlify.app>.

## How to Use

PktFlowVis takes a JSON file as an input. This JSON file should be obtained by exporting a packet capture file in Wireshark to JSON format, by "File -> Export Packet Dissections..." option in the menu.

PktFlowVis consists of two views; a graph view and a timeline view.
The graph view shows network traffic between multiple hosts as a graph, while the timeline view shows the packet flow between two host:ports as a timeline.

## Run & Build

### Prerequisites

Node.js & `yarn` should be installed in your machine.

### Instruction
First, clone the directory to your local machine.
`cd` into the directory, then

```bash
$ yarn
```

to install dependencies for the project.

To run the project locally for development, 
```bash
$ yarn start
```
Then navigate to `http://localhost:3000`.
Note that since our project has many dependent libraries (mostly redundant GUI libraries; we plan to merge them in the future), it may take a while for the app to actually start after running the command.

To build and run the project:
```bash
$ yarn run build
```