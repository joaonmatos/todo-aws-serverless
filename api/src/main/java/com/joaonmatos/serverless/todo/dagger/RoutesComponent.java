package com.joaonmatos.serverless.todo.dagger;

import com.joaonmatos.serverless.todo.api.Routes;
import dagger.Component;

@Component(modules = {ImplModule.class, EnvModule.class})
public interface RoutesComponent {
    Routes routes();
}
