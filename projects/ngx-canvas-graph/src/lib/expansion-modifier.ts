
import { GraphData } from "./graph-data";
import { Link } from "./link";
import { Node } from "./node";

// traverses nodes/links and only filters out descendents of collapsed nodes
export class ExpansionModifier {

    root: ArrangedNode | undefined;

    uncollapsedGraphData: GraphData;

    constructor(public graphData: GraphData, collapseAtDepth: number) {
        this.uncollapsedGraphData = {nodes: [], links: []};
        this.build(collapseAtDepth);
    }

    build(collapseAtDepth: number) {
        this.uncollapsedGraphData = {nodes: [], links: []};
        const seenNodeIds: string[] = [];
        if (this.graphData.nodes.length > 0) { this.nodeCheck(this.graphData.nodes[0], seenNodeIds, collapseAtDepth, false) }
    }

    nodeCheck(node: Node, seenNodeIds: string[], depth: number, collapsedAbove: boolean) {
        
        seenNodeIds.push(node.id);

        const forcedCollapse = depth <= 0;
        const forcedPreviuosly = depth < 0;

        if (forcedCollapse) {
            node.internalDisplayState = 'collapsed';
        }

        if (!forcedPreviuosly && !collapsedAbove) {
            this.uncollapsedGraphData.nodes.push(node);
        }

        const childSet = this.graphData.links
            .filter(link => link.fromNodeId === node.id)
            .map(link => ({link: link, targetNode: this.graphData.nodes.find(node => node.id === link.toNodeId)}))
            .filter(x => x.targetNode !== undefined) as {link: Link, targetNode: Node}[];

        if (childSet.length === 0) {
            node.internalDisplayState = 'last';
            return;
        }

        let isCollapsed = true;
        if (node.internalDisplayState === 'expanded' && !collapsedAbove) {
            this.uncollapsedGraphData.links.push(... childSet.map(x => x.link));        
            isCollapsed = false;
        }

        const unseenChildren = childSet.filter(x => !seenNodeIds.find(seenId => x.targetNode.id === seenId));
        unseenChildren.forEach(child => {
            this.nodeCheck(child.targetNode, seenNodeIds, depth - 1, isCollapsed)
        });
    
        
    }

    // called when user collapses a node

    toggleCollapse(node: Node): boolean {
        if (node.internalDisplayState !== 'last') {
            node.internalDisplayState = node.internalDisplayState === 'expanded' ? 'collapsed' : 'expanded';
            this.build(99);
            return true;
        } else {
            return false;
        }
        
    }
}

export class ArrangedNode {

    state: 'collapsed' | 'expanded' | 'last' = 'expanded';

    children: ArrangedNode[] = [];
    constructor(public node: Node) {}

    static Factory(graphData: GraphData): ArrangedNode | undefined {

        if (graphData.nodes.length === 0) {
            return undefined;
        } else {
            const seenNodeIds: string[] = [];
            const root = new ArrangedNode(graphData.nodes[0]);
            seenNodeIds.push(root.node.id);
            this.AddChildren(root, graphData, seenNodeIds);
            return root;
        }        
    }

    static processArrangedNode() {


    }
    static AddChildren(parent: ArrangedNode, graphData: GraphData, seenNodeIds: string[]) {
        
        parent.children = graphData.links
            .filter(link => link.fromNodeId === parent.node.id)
            .map(link => graphData.nodes.find(node => node.id === link.toNodeId))
            .filter(toNode => toNode !== undefined)
            .map(toNode => new ArrangedNode(toNode as Node));

        const firstTime = parent.children.filter(child => seenNodeIds.find(x => x === child.node.id) === undefined);
        firstTime.forEach(child => {            
            seenNodeIds.push(child.node.id);
            this.AddChildren(child, graphData, seenNodeIds)
        })
    }
}