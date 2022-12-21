export class PriorityQueue<T> {
    private readonly comparator: any;
    private readonly heap: any;

    private top = 0;
    private parent = (i: number) => ((i + 1) >>> 1) - 1;
    private left = (i: number) => (i << 1) + 1;
    private right = (i: number) => (i + 1) << 1;

    constructor(comparator = (a: T, b: T) => a > b) {
        this.heap = [];
        this.comparator = comparator;
    }

    public size(): number {
        return this.heap.length;
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }

    public peek(): T {
        return this.heap[this.top];
    }

    public push(...values: T[]) {
        values.forEach(value => {
            this.heap.push(value);
            this.siftUp();
        });
        return this.size();
    }

    public pop(): T {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > this.top) {
            this.swap(this.top, bottom);
        }
        this.heap.pop();
        this.siftDown();
        return poppedValue;
    }

    private replace(value: T): T {
        const replacedValue = this.peek();
        this.heap[this.top] = value;
        this.siftDown();
        return replacedValue;
    }

    private greater(i: number, j: number) {
        return this.comparator(this.heap[i], this.heap[j]);
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private siftUp(): void {
        let node: number = this.size() - 1;
        while (node > this.top && this.greater(node, this.parent(node))) {
            this.swap(node, this.parent(node));
            node = this.parent(node);
        }
    }

    private siftDown(): void {
        let node = this.top;
        while (this.left(node) < this.size() && this.greater(this.left(node), node) ||
        this.right(node) < this.size() && this.greater(this.right(node), node)) {
            const maxChild = (this.right(node) < this.size() && this.greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
            this.swap(node, maxChild);
            node = maxChild;
        }
    }
}