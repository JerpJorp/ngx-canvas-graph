export class Link {

    fromNodeId: string | undefined;
    toNodeId: string | undefined;
    
    constructor(public displayText: string, 
        public color?: string, 
        public properties?: { [index: string]: any}) {
            
    }
}
