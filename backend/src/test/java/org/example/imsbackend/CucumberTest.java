package org.example.imsbackend;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(
    features = "classpath:features/",
    glue = "org.example.imsbackend.steps",
    plugin = {"pretty", "html:target/cucumber-reports.html"}
)
public class CucumberTest {
}