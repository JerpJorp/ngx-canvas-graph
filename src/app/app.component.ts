import { Component, OnInit } from '@angular/core';
import { NgxCanvasGraphService, GraphBuilder, Node, BuiltNode, Link  } from 'ngx-canvas-graph';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ngx-canvas-graph-wrapper';

  constructor(private graphSvc: NgxCanvasGraphService) {

  }

  ngOnInit(): void {
    this.FakeAndDraw(); 
  }

  FakeAndDraw() {
    const builder: GraphBuilder = new GraphBuilder();

    const root = builder.AddNode(new Node('ROOT'));

    this.RecurseBuild(root, 0, 5);

    this.graphSvc.RenderBuilder(builder);

  }
  RecurseBuild(root: BuiltNode, depth: number, maxDepth: number) {

    if (depth < maxDepth) {
      Array(3).fill(0).forEach((value, idx) => {

        if (Math.random() > 0.66 || idx === 0) {
          const child = root.AddLinkTo(new Link('', 'rgba(5,5,5,.125)'), new Node(root.node.displayText + '.' + idx ));
          this.RecurseBuild(child.endNode, depth + 1, maxDepth);  
        }
      });
    }
  }

  
}
