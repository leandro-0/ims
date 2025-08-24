package org.example.imsbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.services.DashboardService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public Object getStats() {
        return dashboardService.getStats();
    }


}
