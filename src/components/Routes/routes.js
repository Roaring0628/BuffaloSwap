import React, { lazy, Suspense } from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import {
    Dimmer,
    Loader
} from 'semantic-ui-react';

const RisingSunTracker = lazy (() => import('../RisingSunTracker'));

const Routes = () => {
    return (
        <Suspense fallback={
            // <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
            // </Dimmer>
        }>
            <BrowserRouter>
                <Switch>
                    <Route exact path='/' component={RisingSunTracker} />
                </Switch>
            </BrowserRouter>
        </Suspense>
    )
}

export default Routes;

