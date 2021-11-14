import { Link } from "./link";
import { Node } from "./node";

export class GraphBuilder {

    nodes: Node[];
    links: Link[];

    constructor() {
        this.nodes = [];
        this.links = [];
    }

    AddNode(node: Node): BuiltNode {
        this.nodes.push(node);
        return new BuiltNode(this, node);
    }
}

export class BuiltNode {
    constructor(private builder: GraphBuilder, public node: Node) {}
    AddLinkTo(link: Link, toNode: Node): BuiltLink  {
        
        this.builder.nodes.push(toNode);
        link.fromNodeId = this.node.id;
        link.toNodeId = toNode.id;
        this.builder.links.push(link);
        return new BuiltLink(this.builder, link, new BuiltNode(this.builder, toNode));
    }
}

export class BuiltLink {
    constructor(private builder: GraphBuilder, public link: Link, public endNode: BuiltNode) {

    }
}