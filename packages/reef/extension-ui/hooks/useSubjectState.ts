import {ReplaySubject} from "rxjs";
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
