import { Component, OnInit } from '@angular/core';

import * as faker from "faker";

import { GraphBuilder, Node, BuiltNode, Link, GraphData, INodeOverrideParameters, ILinkOverrideParameters, IClearOverrideParameters  } from 'ngx-canvas-graph';
import { CanvasHelper } from 'ngx-smart-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  lastMessage = '';

  graphData: GraphData = new GraphData();

  plain = true;
  constructor() { }

  ngOnInit(): void {
    this.FakeAndDraw(); 
  }

  nodeClick(node: Node) {
    if (node) {this.lastMessage = 'clicked on ' + node.displayText;}
  }

  nodeMouseOver(node: Node) {
    if (node) {this.lastMessage = 'mouse over ' + node.displayText;}
  }

  recreate() {
    this.FakeAndDraw();
  }

  FakeAndDraw() {
    const builder: GraphBuilder = new GraphBuilder();
    const root = builder.AddNode(new Node('Root'));
    this.RecurseBuild(root, 0, 10);
    this.graphData = new GraphData();
    this.graphData = builder.graphData;
  }

  RecurseBuild(root: BuiltNode, depth: number, maxDepth: number) {

    if (depth < maxDepth) {
      Array(3).fill(0).forEach((value, idx) => {

        if (Math.random() > 0.8 || idx === 0) {
          const child = root.AddLinkTo(new Link('', 'rgba(5,5,5,.125)'), new Node(faker.lorem.words(depth+1)));
          this.RecurseBuild(child.endNode, depth + 1, maxDepth);  
        }
      });
    }
  }

  clearOverride(params: IClearOverrideParameters) {
    const ctx = params.ctx;

    params.ctx.shadowColor = '#12FF12';
    params.ctx.shadowBlur = 0;

    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Will always clear the right space
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

    const grd = ctx.createLinearGradient(0, 0, 170,0);
    grd.addColorStop(0, "#BBBBBB");
    grd.addColorStop(1, "white");

    ctx.fillStyle = grd;
    ctx.fillRect(0,0,ctx.canvas.width / 2,ctx.canvas.height);

    ctx.restore();
  }

  customLinkDraw(params: ILinkOverrideParameters) {

    if (Math.random() > .5) {
      params.completed = false;
      return;
    }

    params.ctx.strokeStyle = '#404090';
    params.ctx.lineWidth  = 2;
    
    const startX = params.extEdge.start.x + (params.extEdge.start.width / 2);
    const startY = params.extEdge.start.y + (params.extEdge.start.height / 2);

    const endX = params.extEdge.end.x + (params.extEdge.end.width / 2);
    const endY = params.extEdge.end.y + (params.extEdge.end.height / 2)

    params.ctx.beginPath();
    params.ctx.moveTo(startX, startY);
    params.ctx.lineTo(endX, endY);
    params.ctx.stroke();
  }

  customNodeDraw(params: INodeOverrideParameters) {

    if (Math.random() > .5) {
      params.completed = false;
      return;
    }
    params.ctx.shadowColor = '#050505';
    params.ctx.shadowBlur = 12;

    CanvasHelper.roundRect(params.ctx, params.extNode.x, params.extNode.y, params.extNode.width, params.extNode.height, 12);
    params.ctx.fillStyle = params.extNode.source.backColor ? params.extNode.source.backColor : '#dddddd';
    params.ctx.fill();
    
    params.ctx.strokeStyle = 'black';
    params.ctx.stroke();
    if (params.extNode.source.displayText) {
      params.ctx.fillStyle = 'brown';
      params.ctx.fillText('Custom text in override', params.extNode.x + (params.extNode.width / 2), params.extNode.y + 27);
    }
  }

}
