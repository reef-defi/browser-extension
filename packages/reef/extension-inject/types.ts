import {Injected} from "@reef-defi/extension-inject/types";
import {ReefSigners} from "../extension-base/src/page/ReefSigners";

export interface ReefInjected extends Injected{
    accountSigner: ReefSigners;
}
