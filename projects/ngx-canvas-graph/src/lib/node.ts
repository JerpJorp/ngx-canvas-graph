import * as uuid from 'uuid';

export class Node {
    id: string;

    constructor(public displayText: string, 
        public backColor?: string, 
        public textColor?: string,
        public properties?: { [index: string]: any}) {
      
      this.id = 'id' + uuid.v4();

    }
}
