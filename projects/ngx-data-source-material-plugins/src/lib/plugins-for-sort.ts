import { MatSort, Sort } from "@angular/material/sort";
import { merge, Observable, OperatorFunction, pipe } from "rxjs";
import { filter, map } from "rxjs/operators";
import { CompareFunction, SortFT } from "ngx-data-source";

export type CompareFunctions<T, F = keyof T> = { [K in F & string]: CompareFunction<T> }

export const remapSortPipe = 
    <T, F = keyof T>(comparators: CompareFunctions<T, F>): OperatorFunction<Sort, SortFT<T, F>> => {

    return  pipe(
                map(sortEvent => composeSortFT(sortEvent, comparators)),
                filter((sortEvent): sortEvent is SortFT<T, F> => !!sortEvent)
            );
}

export const extractEventStreamFromSorts = 
    <T, F = keyof T>(comparators: CompareFunctions<T, F>, ...sorts: MatSort[]): Observable<SortFT<T, F>> => {
        
    const arrayOfSortObservables = sorts.map(sort => sort.sortChange.asObservable()); 
    return merge(...arrayOfSortObservables).pipe(remapSortPipe(comparators));
}

const composeSortFT = 
    <T, F = keyof T>(sortEvent: Sort, comparators: CompareFunctions<T, F>): SortFT<T, F> | undefined => {
    if (isKeyOfF(sortEvent.active, comparators)) {
        return {
            active: sortEvent.active,
            direction: sortEvent.direction,
            compareFunction: comparators[sortEvent.active]
        }
    } else
        return undefined
}

const isKeyOfF = <T, F>(key: string, comparators: CompareFunctions<T, F>): key is F & string => {
    return comparators.hasOwnProperty(key);
}