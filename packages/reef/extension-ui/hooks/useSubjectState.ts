/*import {BehaviorSubject, skip} from "rxjs";
import {useEffect, useState} from "react";

export const useSharedState = <T>(subject: BehaviorSubject<T>): [value:T, setFn:(value:T)=>void] => {
  const [value, setState] = useState(subject.getValue());
  useEffect(() => {
    const sub = subject.pipe(skip(1)).subscribe(s => setState(s));
    return () => sub.unsubscribe();
  });
  const newSetState = (state:T) => subject.next(state);
  return [value, newSetState];
};*/
import {Observable, ReplaySubject} from "rxjs";
import {useEffect, useState} from "react";
import {utils,} from "@reef-defi/react-lib";

export const useSubjectState = <T>(subject: ReplaySubject<T>): [value:utils.DataWithProgress<T>, setFn:(value:T)=>void] => {
  const [value, setState] = useState<utils.DataWithProgress<T>>(utils.DataProgress.LOADING);
  useEffect(() => {
    const sub = subject.subscribe(s => setState(s));
    return () => sub.unsubscribe();
  });
  const newSetState = (state:T) => subject.next(state);
  return [value, newSetState];
};

export const useSubjectStateObserver = <T>(observable: Observable<T>): utils.DataWithProgress<T> => {
  const [value, setValue] = useState<utils.DataWithProgress<T>>(utils.DataProgress.LOADING);
  useEffect(() => {
    const sub = observable.subscribe(s => {
      console.log("RRRR=",s);
      setValue(s)
    });
    return () => sub.unsubscribe();
  });
  return value;
};
