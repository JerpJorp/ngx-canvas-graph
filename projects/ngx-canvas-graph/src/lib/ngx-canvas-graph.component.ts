import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';

import { Subject } from 'rxjs';
import {filter, takeUntil } from 'rxjs/operators';

import * as dagre from "dagre";
import * as uuid from 'uuid';

import { CanvasHelper, NgxSmartCanvasService, SmartCanvasInfo } from 'ngx-smart-canvas';

import { Node } from './node';
import { Link } from './link';
import { GraphData, IExtendedEdge, IExtendedNode } from './graph-data';
import { IClearOverrideParameters, ILinkOverrideParameters, INodeOverrideParameters } from './override-parameters';
import { ExpansionModifier } from './expansion-modifier';

@Component({
  selector: 'lib-ngx-canvas-graph',
  templateUrl: './ngx-canvas-graph.component.html',
  styles: [
  ]
})
export class NgxCanvasGraphComponent implements OnInit, OnChanges, OnDestroy {

  @Input() graphId = uuid.v4();

  @Input() graphData = new GraphData();
  
  @Input() graphSettings: dagre.GraphLabel = { 
    width: 1800, 
    height: 1000, 
    nodesep: 20, 
    ranksep: 15, 
    rankdir: 'LR' };


  @Input() initialCollapseDepth = 99;

  @Output() nodeClick = new EventEmitter<Node>();
  @Output() nodeDoubleClick = new EventEmitter<Node>();
  @Output() nodeMouseOver = new EventEmitter<Node>();

  @Output() linkDrawOverride = new EventEmitter<ILinkOverrideParameters>();
  @Output() nodeDrawOverride = new EventEmitter<INodeOverrideParameters>();
  @Output() clearOverride = new EventEmitter<IClearOverrideParameters>();

  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  destroyed$: Subject<void> = new Subject<void>();

  edges: IExtendedEdge[] = [];
  nodes: dagre.Node<IExtendedNode>[] = [];

  lastMousedNode: Node | undefined;

  expansionModifier: ExpansionModifier | undefined;

  constructor(private smartSvc: NgxSmartCanvasService) { }

  ngOnInit(): void {

    this.smartSvc.ready$.pipe(takeUntil(this.destroyed$), filter(x => x !== undefined && x.componentId === this.graphId)).subscribe(x => {
      this.ctx = x?.ctx as CanvasRenderingContext2D;
      this.expansionModifier = new ExpansionModifier(this.graphData, this.initialCollapseDepth);
      this.Draw(this.ctx);
    });

    this.smartSvc.redrawRequest$.pipe(takeUntil(this.destroyed$), filter(x => x.componentId === this.graphId)).subscribe(x => this.Draw(x.ctx));

    this.smartSvc.click$.pipe(takeUntil(this.destroyed$), filter(x => x.componentId === this.graphId)).subscribe(x => this.MouseClick(x));

    this.smartSvc.doubleClick$.pipe(takeUntil(this.destroyed$), filter(x => x.componentId === this.graphId)).subscribe(x => this.MouseDoubleClick(x));

    this.smartSvc.mouseOver$.pipe(takeUntil(this.destroyed$), filter(x => x.componentId === this.graphId)).subscribe(x => this.MouseOver(x));


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.graphData) {
      this.expansionModifier = new ExpansionModifier(this.graphData, this.initialCollapseDepth);
      this.ProcessNodes();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  ProcessNodes(): void {

    if (this.ctx) {
      this.clear(this.ctx);
    }

    const data = this.expansionModifier?.uncollapsedGraphData;
    if (data && data.nodes.length > 0) {
      const nodes = data.nodes;
      const links = data.links;
      const graph = new dagre.graphlib.Graph();
      graph.setGraph(this.graphSettings);
      nodes.forEach(node => graph.setNode(node.id, { width: 50 + node.displayText.length * 8, height: 42, source: node }));
      links.forEach(link => graph.setEdge(link.fromNodeId as string, link.toNodeId as string, { source: link }));
      dagre.layout(graph);
      this.edges = graph.edges()
        .map(e => {
          const x = graph.edge(e) as unknown as {source: Link, points: Array<{ x: number; y: number }>};        
          return { start: graph.node(e.v), end: graph.node(e.w), link: x.source, points: x.points }
        })
        .filter(x => x.start && x.end) ;

      this.nodes = graph.nodes().map(n => graph.node(n) as dagre.Node<IExtendedNode>);
    }
    if (this.ctx) {
      this.Draw(this.ctx);
    }
  }
 
  Draw(ctx: CanvasRenderingContext2D) {
    this.clear(this.ctx as CanvasRenderingContext2D);
    this.edges.forEach(e => this.drawEdge(e, this.ctx as CanvasRenderingContext2D));
    this.nodes.forEach(n => this.drawNode(n, this.ctx as CanvasRenderingContext2D));
    
  }

  private drawEdge(e: IExtendedEdge, ctx: CanvasRenderingContext2D) {

    if (this.linkDrawOverride.observers.length > 0) {
      const p: ILinkOverrideParameters = {extEdge: e, ctx: ctx, completed: true};

      this.linkDrawOverride.emit(p);
      if (p.completed) {
        return;
      }
    }

    ctx.strokeStyle = e.link.color || 'rgba(200,200,200,.125)';
    ctx.lineWidth  = 3;

    const startX = e.start.x + (e.start.width / 2);
    const startY = e.start.y + (e.start.height / 2);

    const endX = e.end.x + (e.end.width / 2);
    const endY = e.end.y + (e.end.height / 2)

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  private drawNode(n: dagre.Node<IExtendedNode>, ctx: CanvasRenderingContext2D) {
    
    if (this.nodeDrawOverride.observers.length > 0) {
      const p: INodeOverrideParameters = {extNode: n, ctx: ctx, completed: true};
      this.nodeDrawOverride.emit(p);

      if (p.completed) {
        return;
      }
      
    }

    ctx.font = "18px system-ui";
    ctx.textAlign = 'center'
    ctx.lineWidth  = 3;
    ctx.shadowColor = '#AAAAAA';
    ctx.shadowBlur = 4;

    ctx.fillStyle = n.source.backColor ? n.source.backColor : '#dddddd';
    CanvasHelper.roundRect(ctx, n.x, n.y, n.width, n.height, 5);    
    ctx.fill();    
    ctx.strokeStyle = 'black';    
    ctx.stroke();
    if (n.source.internalDisplayState === 'collapsed') {
      this.drawExpandIndicator(n, ctx);
    }    
    if (n.source.displayText) {
      ctx.fillStyle = n.source.textColor ? n.source.textColor : 'black';
      ctx.fillText(n.source.displayText, n.x + (n.width / 2), n.y + 27);
    }
  }

  drawExpandIndicator(n: dagre.Node<IExtendedNode>, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.ellipse(n.x + n.width + 8, n.y + n.height / 2, 3, 4, 0, 0, 2 * Math.PI)
    ctx.closePath();
    ctx.stroke();
  }

  MouseOver(x: SmartCanvasInfo): void {
    const matching = this.findMatchingNode(x);
    if (matching) {
      if (this.lastMousedNode && this.lastMousedNode.id === matching.id) {
        // do nothing
      } else {
        this.lastMousedNode = matching;
        this.nodeMouseOver.emit(matching);        
      }
    }   
  }

  MouseDoubleClick(x: SmartCanvasInfo): void {
    const matching = this.findMatchingNode(x);
    this.lastMousedNode = matching;

    if (this.expansionModifier && matching) {
      if (this.expansionModifier.toggleCollapse(matching)) {
        this.ProcessNodes();
      }

    }
    if (this.lastMousedNode) {
      this.nodeDoubleClick.emit(matching);
    }
  }

  MouseClick(x: SmartCanvasInfo): void {
    const matching = this.findMatchingNode(x);
    this.lastMousedNode = matching;

    if (this.lastMousedNode) {
      this.nodeClick.emit(matching);
    }
  }
  
  private findMatchingNode(x: SmartCanvasInfo): Node | undefined {

    if (x.mouseToCanvas) {
      
      const canvasXY = x.mouseToCanvas.canvasXY;

      const matching = this.nodes.find(n =>
        n.x < canvasXY.x && canvasXY.x < n.x + n.width &&
        n.y < canvasXY.y && canvasXY.y < n.y + n.height);

      return matching ? matching.source : undefined;

    } else {
      return undefined;
    }
  }

  clear(ctx: CanvasRenderingContext2D) {

    if (this.clearOverride.observers.length > 0) {
      const p: IClearOverrideParameters = {ctx: ctx, completed: true};
      this.clearOverride.emit(p);
      if (p.completed) {
        return;
      }
    }
    
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Will always clear the right space
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.restore();
    
  }
}



