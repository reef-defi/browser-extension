import {Observable, Subscription} from "rxjs";
import {useEffect, useState} from "react";

export const useObservableState = <T>(observable: Observable<T>): T | undefined => {
  const [value, setValue] = useState<T>();
  let subs: Subscription;
  useEffect(() => {
    subs?.unsubscribe();
    subs = observable.subscribe(s => {
      setValue(s);
    });
    return () => subs?.unsubscribe();
  }, [observable]);
  return value;
};

/*
export const useObservableStateProgress = <T>(observable: Observable<DataWithProgress<T>>): utils.DataWithProgress<T> => {
  const [value, setValue] = useState<utils.DataWithProgress<T>>(utils.DataProgress.LOADING);
  useEffect(() => {
    const sub = observable.subscribe(s =>setValue(s));
    return () => sub.unsubscribe();
  });
  return value;
};
*/
