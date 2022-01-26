import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { concat, merge, Observable, partition, Subscription } from "rxjs";
import { filter, first, map, pairwise } from "rxjs/operators";
import { NgxDataSource, PaginatorState, Indexed, PageIndex, PageSize } from "ngx-data-source";

interface PageEventsObservables {
    pageSize: Observable<PageSize>,
    pageChange: Observable<PageIndex>
}

interface State {
    pageSize: number,
    pageIndex: number,
    length: number
}

export class MaterialPaginatorConnector<T, F> {

    private paginators: MatPaginator[];
    private paginatorStateSubscription!: Subscription;

    constructor(
        private customDataSource: NgxDataSource<T, F>, 
        ...paginators: MatPaginator[]
    ) {
        this.paginators = paginators;
        this.connect();
    }

    private connect(): void {
        const { pageSize, pageChange } = this.extractStreams();
        
        this.customDataSource.getInputPlummer().connectPageSizePipe(pageSize);
        this.customDataSource.getInputPlummer().connectPageChangePipe(pageChange);

        this.setUpPaginatorsStateUpdater();
    }

    disconnect(): void {
        this.paginatorStateSubscription.unsubscribe();
    }

    private extractStreams(): { pageSize: Observable<PageSize>, pageChange: Observable<PageIndex>} {
        const observablesFromAllPaginators: Observable<PageEvent>[] = 
            this.paginators.map(paginator => paginator.page.asObservable()); 
        const eventsMergedIntoOneStream$ = merge(...observablesFromAllPaginators);  
        return this.remapMatPagination(eventsMergedIntoOneStream$); 
    }

    private setUpPaginatorsStateUpdater(): void {
        this.paginatorStateSubscription = this.customDataSource.getPaginatorState().subscribe(
            state => this.updatePaginators(state)
        );
    }

    private remapMatPagination(pagination: Observable<PageEvent>): PageEventsObservables {
            const pageSizeAndChangeInOneStream$ = this.getPageSizeAndChangeInOneStream(pagination); 
            const [pageSize, pageChange] = this.divideStream(pageSizeAndChangeInOneStream$);
            return this.clarifyTypesOnStreams(pageSize, pageChange); 
    }

    private updatePaginators(state: State): void {
        this.paginators.forEach(paginator => this.setState(paginator, state));
    }

    private getPageSizeAndChangeInOneStream(pagination: Observable<PageEvent>): Observable<PageSize | PageIndex> {
        return  concat(this.getPaginatorsInitialState(), pagination).pipe(
                    pairwise(),
                    map(([previous, current]) => this.extractEvent(previous, current))
                );
    }

    private divideStream(
        stream$: Observable<PageSize | PageIndex>
    ): [Observable<PageSize | PageIndex>, Observable<PageIndex | PageSize>] {
        return partition(stream$, event => this.isPageSizeEvent(event))
    } 

    private clarifyTypesOnStreams(
        pageSize: Observable<PageSize | PageIndex>, 
        pageChange: Observable<PageIndex | PageSize>
    ): { pageSize: Observable<PageSize>, pageChange: Observable<PageIndex>} {
        return {
            pageSize: pageSize.pipe(filter((event): event is PageSize => this.isPageSizeEvent(event))),
            pageChange: pageChange.pipe(filter((event): event is PageIndex => this.isPageChangeEvent(event)))
        };
    }

    private setState(paginator: MatPaginator, state: State): void {
        paginator.pageSize = state.pageSize;
        paginator.pageIndex = state.pageIndex;
        paginator.length = state.length;
    }

    private getPaginatorsInitialState(): Observable<PaginatorState<Indexed<T>>> {
        return this.customDataSource.getPaginatorState().pipe(first());
    }

    private extractEvent(previous: PageEvent, current: PageEvent): PageSize | PageIndex {
        if (previous.pageSize !== current.pageSize) 
            return { pageSize: current.pageSize }
        else 
            return { pageIndex: current.pageIndex }
    }
    
    private isPageSizeEvent(event: PageSize | PageIndex): event is PageSize {
        if ('pageSize' in event) return true;
        else return false;
    }
    
    private isPageChangeEvent(event: PageSize | PageIndex): event is PageIndex {
        if ('pageIndex' in event) return true;
        else return false;
    }
}