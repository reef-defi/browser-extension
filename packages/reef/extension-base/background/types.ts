/*export interface ReefRequestSignatures {
    'pri(accounts.select)': [RequestAccountSelect, boolean];
}*/

/*export type ReefRequestTypes = {
    [MessageType in keyof ReefRequestSignatures]: ReefRequestSignatures[MessageType][0]
};

export type ReefResponseTypes = {
    [MessageType in keyof ReefRequestSignatures]: ReefRequestSignatures[MessageType][1]
};

export type ReefSubscriptionMessageTypes = NoUndefinedValues<{
    [MessageType in keyof ReefRequestSignatures]: ReefRequestSignatures[MessageType][2]
}>;

export type ReefResponseType<TMessageType extends keyof ReefRequestSignatures> = ReefRequestSignatures[TMessageType][1];

export type ReefMessageTypes = keyof ReefRequestSignatures;

export type ReefMessageTypesWithSubscriptions = keyof ReefSubscriptionMessageTypes;
export type ReefMessageTypesWithNoSubscriptions = Exclude<ReefMessageTypes, keyof ReefSubscriptionMessageTypes>

interface ReefTransportResponseMessageSub<TMessageType extends ReefMessageTypesWithSubscriptions> {
    error?: string;
    id: string;
    response?: ReefResponseTypes[TMessageType] | ReefResponseTypes[TMessageType];
    subscription?: ReefSubscriptionMessageTypes[TMessageType] | ReefSubscriptionMessageTypes[TMessageType];
}

interface ReefTransportResponseMessageNoSub<TMessageType extends ReefMessageTypesWithNoSubscriptions> {
    error?: string;
    id: string;
    response?: ReefResponseTypes[TMessageType];
}

export type ReefTransportResponseMessage<TMessageType extends ReefMessageTypes> =
    TMessageType extends ReefMessageTypesWithNoSubscriptions
        ? ReefTransportResponseMessageNoSub<TMessageType>
        : TMessageType extends ReefMessageTypesWithSubscriptions
        ? ReefTransportResponseMessageSub<TMessageType>
        : never;*/
