import { IExtendedEdge, IExtendedNode } from "./graph-data";

export interface ILinkOverrideParameters {
    extEdge: IExtendedEdge;
    ctx: CanvasRenderingContext2D;
    completed: boolean;
}

export interface INodeOverrideParameters {
    extNode: dagre.Node<IExtendedNode>;
    ctx: CanvasRenderingContext2D
    completed: boolean;
}


export interface IClearOverrideParameters {
    ctx: CanvasRenderingContext2D;
    completed: boolean;    
}