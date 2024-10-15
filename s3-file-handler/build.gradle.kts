plugins {
    id("java")
    id("com.gradleup.shadow") version "8.3.3"
}

group = "com.joaonmatos.serverless.todo"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.slf4j:slf4j-api:2.0.16")
    runtimeOnly("org.apache.logging.log4j:log4j-layout-template-json:2.24.1")
    runtimeOnly("org.apache.logging.log4j:log4j-slf4j2-impl:2.24.1")
    runtimeOnly("com.amazonaws:aws-lambda-java-log4j2:1.6.0")
    implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
    implementation("com.amazonaws:aws-lambda-java-events:3.14.0")
    implementation(platform("software.amazon.awssdk:bom:2.28.22"))
    implementation("software.amazon.awssdk:cloudfront")
    implementation("software.amazon.awssdk:s3")
    implementation("software.amazon.awssdk:ssm")
    implementation(platform("com.fasterxml.jackson:jackson-bom:2.18.0"))
    implementation("com.fasterxml.jackson.core:jackson-databind")
}

tasks.withType<JavaCompile> {
    options.release = 21
}

tasks.build {
    dependsOn("shadowJar")
}

tasks.shadowJar {
    transform(com.github.jengelman.gradle.plugins.shadow.transformers.Log4j2PluginsCacheFileTransformer::class.java)
}
