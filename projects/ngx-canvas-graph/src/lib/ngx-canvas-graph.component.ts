import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import * as dagre from "dagre";

import { CanvasHelper, NgxSmartCanvasService, SmartCanvasInfo } from 'ngx-smart-canvas';

import { NgxCanvasGraphService } from './ngx-canvas-graph.service';

import { Node } from './node';
import { Link } from './link';

@Component({
  selector: 'lib-ngx-canvas-graph',
  templateUrl: './ngx-canvas-graph.component.html',
  styles: [
  ]
})
export class NgxCanvasGraphComponent implements OnInit, OnDestroy {

  @Input() graphSettings: dagre.GraphLabel = { 
    width: 1800, 
    height: 1000, 
    nodesep: 20, 
    ranksep: 15, 
    rankdir: 'LR' };

  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  destroyed$: Subject<void> = new Subject<void>();

  edges: IExtendedEdge[] = [];
  nodes: dagre.Node<IExtendedNode>[] = [];

  constructor(private svc: NgxCanvasGraphService, private smartSvc: NgxSmartCanvasService) { }

  ngOnInit(): void {

    this.smartSvc.ready$.pipe(filter(x => x !== undefined)).subscribe(x => {
      this.ctx = x?.ctx as CanvasRenderingContext2D;
      this.Draw(this.ctx);
    });

    this.smartSvc.redrawRequest$.subscribe(x => this.Draw(x.ctx));

    this.smartSvc.click$.subscribe(x => this.MouseClick(x));
    this.svc.nodes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(nodes => this.ProcessNodes());

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  ProcessNodes(): void {
    if (this.svc.nodes$.value) {
      const nodes = this.svc.nodes$.value.nodes;
      const links = this.svc.nodes$.value.links;
      const graph = new dagre.graphlib.Graph();
      graph.setGraph(this.graphSettings);
      nodes.forEach(node => graph.setNode(node.id, { width: 50 + node.displayText.length * 8, height: 42, source: node }));
      links.forEach(link => graph.setEdge(link.fromNodeId as string, link.toNodeId as string, { source: link }));
      dagre.layout(graph);
      this.edges = graph.edges().map(e => {
        const x = graph.edge(e) as unknown as {source: Link, points: Array<{ x: number; y: number }>};        
        return { start: graph.node(e.v), end: graph.node(e.w), link: x.source, points: x.points }
      });

      this.nodes = graph.nodes().map(n => graph.node(n) as dagre.Node<IExtendedNode>);
    }
    if (this.ctx) {
      this.Draw(this.ctx);
    }
  }
 

  Draw(ctx: CanvasRenderingContext2D) {

    //this.clear(ctx);
    ctx.shadowColor = '#AAAAAA';
    // ctx.shadowBlur = 10;

    ctx.font = "18px system-ui";
    ctx.textAlign = 'center'
    this.edges.forEach(e => this.drawEdge(e, this.ctx as CanvasRenderingContext2D));
    this.nodes.forEach(n => this.drawNode(n, this.ctx as CanvasRenderingContext2D))

  }

  private drawEdge(e: IExtendedEdge, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = e.link.color || 'rgba(125,125,125,.125)';
    ctx.lineWidth  = 3;

    const startX = e.start.x + (e.start.width / 2);
    const startY = e.start.y + (e.start.height / 2);

    const endX = e.end.x + (e.end.width / 2);
    const endY = e.end.y + (e.end.height / 2)

    // ctx.beginPath();
    // ctx.moveTo(startX, startY);
    // ctx.bezierCurveTo(startX + e.start.width * 0.8, startY, startX + e.start.width * 0.8 + 20, endY, endX, endY);
    // ctx.stroke();

    if (e.points.length > 0) {
      const first = e.points[0] as IPoint;
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      e.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
  
    }
  }

  private drawNode(n: dagre.Node<IExtendedNode>, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = n.source.backColor ? n.source.backColor : 'gray';
    CanvasHelper.roundRect(ctx, n.x, n.y, n.width, n.height, 5);
    this.ctx?.fill();
    if (n.source.displayText) {
      ctx.fillStyle = n.source.textColor ? n.source.textColor : 'black';
      ctx.fillText(n.source.displayText, n.x + (n.width / 2), n.y + 27);
    }
  }

  MouseClick(x: SmartCanvasInfo): void {
    const matching = this.findMatchingNode(x);
    this.svc.nodeClick$.next(matching);    
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
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Will always clear the right space
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.restore();
    
  }
}

export interface IExtendedNode {
  source: Node;
}

export interface IExtendedEdge {
  start: dagre.Node;
  end: dagre.Node;
  link: Link;
  points: IPoint[]
}

export interface IPoint {
  x: number; 
  y: number;
}