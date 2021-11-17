# NgxCanvasGraph

This library provides the ngx-canvas-graph component (lib-ngx-canvas-graph) that renders graphs using the dagre graph layout algorithm (https://www.npmjs.com/package/dagre).

The library is a result of running into performance issues with the @swimlane/ngx-graph library, which uses svg and allows for user interactivity with the rendered noded for moving them around that causes performance issues with high node counts.  

The graphing component relies on ngx-smart-canvas (https://www.npmjs.com/package/ngx-smart-canvas), which provides a component for wrapping a canvas element and handling scroll/zoom.  

Example usage 
```html
      <lib-ngx-canvas-graph *ngIf="!plain" [graphId]="'customId'" [graphSettings]="{ 
        width: 1800, 
        height: 1000, 
        nodesep: 25, 
        ranksep: 10, 
        rankdir: 'LR' }"
        [initialCollapseDepth]="'3'"
        [graphData]="graphData"
        (nodeClick)="nodeClick($event)"
        (nodeMouseOver)="nodeMouseOver($event)"
        (nodeDrawOverride) = "customNodeDraw($event)"
        (linkDrawOverride) = "customLinkDraw($event)"
        (clearOverride)="clearOverride($event)"
        ></lib-ngx-canvas-graph>

```

### component parameters

* **graphId**: Important only if you are displaying multiple graphs in the same view as it is used to uniquely tag underlying elements.  If not provided, a generic uuid is auto-generated
* **graphSettings**: Instance of dagre.GraphLabel from @types/dagre, and represents the available parameters for the dagre layout algorithm. Default:
```javascript
{   width: 1800, 
    height: 1000, 
    nodesep: 20, 
    ranksep: 15, 
    rankdir: 'LR' }
```
* **initialCollapseDepth**: sets the initial depth in the graph where nodes are collapsed.  Default is 99, which means essentially none are collapsed.  

* **graphData**: Represents the nodes and edges that will be positioned by the dagre algorithm and rendered as a graph.  Updating this input parameter will triger a layout/render cycle.
```javascript
export class GraphData {
    nodes: Node[] = [];
    links: Link[] = []; }
class Node {
    id: string;
    displayText: string; 
    backColor?: string; 
    textColor?: string;
    properties?: { [index: string]: any}) }
class Link {
    fromNodeId: string | undefined;
    toNodeId: string | undefined;
    displayText: string; 
    color?: string;
    properties?: { [index: string]: any}) }
```
* **nodeClick**: Emitted when user clicks on a node (parameter is your Node instance)
* **nodeDoubleClick**: Emitted when user double clicks on a node (parameter is your Node instance).  Note that nodeClick will fire first
* **nodeMouseOver**: Emitted when user hovers on a node (parameter is your Node instance)
* **nodeDrawOverride**: Emitted when drawing a node.  If provided by your code, you can draw the node on the canvas context (provided as an event parameter) instead of the component.  If you implement the handler and choose not to render yourself, you can return false to let the component do the default draw
* **linkDrawOverride**: Emitted when drawing a link.  If provided by your code, you can draw the node on the canvas context (provided as an event parameter) instead of the component. If you implement the handler and choose not to render yourself, you can return false to let the component do the default draw
* **clearOverride**:  Emitted when clearing the canvas. If provided by your code, you can draw/clear/color the blank canvas however you want before the graph rendering occurs
* 
### Other items of note
* To optimize performance, there is no handling of user interaction with the canvas to reposition rendered nodes.  The component relies on the dagre layout algorithm, and the resulting layout is static.  
* Collapse/expand
    *   If you use the initialCollapseDepth input parameter, the component will collapse all nodes beyond the depth value.
    *   Users can toggle expand/collapse after the graph is rendered
        * **double click** toggles expand/collapse for node under mouse
        * **click**
            *   with shift modifer, toggles expand/collapse
            *   with shift + ctrl modifier, toggles expand/collapse for node and all descendents\

## Code scaffolding

Run `ng generate component component-name --project ngx-canvas-graph` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-canvas-graph`.
> Note: Don't forget to add `--project ngx-canvas-graph` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ngx-canvas-graph` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ngx-canvas-graph`, go to the dist folder `cd dist/ngx-canvas-graph` and run `npm publish`.

## Running unit tests

Run `ng test ngx-canvas-graph` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
