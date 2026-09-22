package com.sheets.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardingController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/register",
        "/app",
        "/app/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}