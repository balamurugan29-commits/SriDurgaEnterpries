package com.sridurga.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/{path:^(?!api|h2-console|assets|favicon|logo|manifest|.*\\..*$).*}",
        "/{path:^(?!api|h2-console|assets|favicon|logo|manifest|.*\\..*$).*}/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
