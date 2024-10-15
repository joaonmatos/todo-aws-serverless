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
    implementation("io.avaje:avaje-sigma:0.2")
    implementation("org.slf4j:slf4j-api:2.0.16")
    runtimeOnly("org.apache.logging.log4j:log4j-layout-template-json:2.24.1")
    runtimeOnly("org.apache.logging.log4j:log4j-slf4j2-impl:2.24.1")
    runtimeOnly("com.amazonaws:aws-lambda-java-log4j2:1.6.0")
    implementation("com.google.dagger:dagger:2.52")
    annotationProcessor("com.google.dagger:dagger-compiler:2.52")
    implementation("com.amazonaws:aws-lambda-java-core:1.2.3")
    implementation("com.amazonaws:aws-lambda-java-events:3.14.0")
    implementation(platform("com.fasterxml.jackson:jackson-bom:2.18.0"))
    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation(platform("software.amazon.awssdk:bom:2.28.17"))
    implementation("software.amazon.awssdk:dynamodb-enhanced")
    implementation("software.amazon.awssdk:kms")
    implementation("com.fasterxml.uuid:java-uuid-generator:5.1.0")
    testImplementation(platform("org.junit:junit-bom:5.11.2"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation(platform("org.mockito:mockito-bom:5.14.1"))
    testImplementation("org.mockito:mockito-core")
    testImplementation("org.mockito:mockito-junit-jupiter")
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<JavaCompile> {
    options.release = 21
}

tasks.test {
    useJUnitPlatform()
}

tasks.build {
    dependsOn("shadowJar")
}

tasks.shadowJar {
    transform(com.github.jengelman.gradle.plugins.shadow.transformers.Log4j2PluginsCacheFileTransformer::class.java)
}
