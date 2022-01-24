import {
  ApolloClient, ApolloLink, HttpLink, InMemoryCache, split,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { map } from 'rxjs';
import { selectedNetworkSubj } from '../state/providerState';
import { getGQLUrls } from '../environment';

const splitLink$ = selectedNetworkSubj.pipe(
  map(getGQLUrls),
  map((urls:{ws:string, http:string}) => {
    const httpLink = new HttpLink({
      uri: urls.http,
    });
    const wsLink = new WebSocketLink({
      options: {
        reconnect: true,
      },
      uri: urls.ws,
    });

    return split(
      ({ query }) => {
        const definition = getMainDefinition(query);

        return (
          definition.kind === 'OperationDefinition'
                    && definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );
  }),
);

export const apolloClientInstance$ = splitLink$.pipe(
  map((splitLink) => new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([splitLink]),
  })),
);
