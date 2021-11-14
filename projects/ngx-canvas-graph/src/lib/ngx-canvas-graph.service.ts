import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import { GraphBuilder } from './graph-builder';
import { Node } from './node';
import { Link } from './link';

@Injectable({
  providedIn: 'root'
})
export class NgxCanvasGraphService {

  mouseOver$: Subject<Node> = new Subject<Node>();
  nodeClick$: Subject<Node> = new Subject<Node>();
  linkClick: Subject<Node> = new Subject<Node>();

  nodes$: BehaviorSubject<{nodes: Node[], links: Link[]} | undefined> = 
      new BehaviorSubject<{nodes: Node[], links: Link[]} | undefined>(undefined);

  constructor() { }

  RenderBuilder(b: GraphBuilder) {
    this.Render(b.nodes, b.links);
  }
  
  Render(nodes: Node[], links: Link[]) {
    this.nodes$.next({nodes: nodes, links: links});
  }

}
