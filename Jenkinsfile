pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-deployer
  containers:
  - name: docker
    image: docker:26.1.0
    command:
    - cat
    tty: true
    resources:
      requests:
        memory: "2Gi"
        cpu: "1"
      limits:
        memory: "4Gi"
        cpu: "2"
    volumeMounts:
    - name: docker-socket
      mountPath: /var/run/docker.sock
  - name: kubectl
    image: lachlanevenson/k8s-kubectl:v1.25.4
    command:
    - cat
    tty: true
  - name: maven
    image: maven:3.9.9-eclipse-temurin-23-alpine
    command:
    - cat
    tty: true
    resources:
    requests:
        memory: "1Gi"
        cpu: "500m"
    limits:
        memory: "2Gi"
        cpu: "1"
    envFrom:
    - configMapRef:
        name: spaceforces-config
    - secretRef:
        name: spaceforces-secrets
  volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
      type: Socket
        '''
        }
    }

    environment {
        DOCKER_CREDS = credentials('dockerhub-creds')
        DOCKER_REGISTRY = 'idrisselabidi'

        GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        IMAGE_TAG = "${GIT_COMMIT_SHORT}-${BUILD_NUMBER}"

        BACKEND_VERSION = "${IMAGE_TAG}"
        FRONTEND_VERSION = "${IMAGE_TAG}"
    }

    // triggers {
    //     pollSCM('H/5 * * * *')
    // }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Determine Changes') {
            steps {
                script {
                    def changedFiles = sh(script: 'git diff --name-only HEAD^ HEAD', returnStdout: true).trim().split('\n')
                    echo "Changed files: ${changedFiles}"

                    env.BUILD_FRONTEND = false
                    env.BUILD_BACKEND = false

                    for (String file : changedFiles) {
                        if (file.startsWith('spaceforces-front/')) {
                            env.BUILD_FRONTEND = true
                        }
                        if (file.startsWith('spaceforces-back/')) {
                            env.BUILD_BACKEND = true
                        }
                    }

                    if (!env.BUILD_FRONTEND && !env.BUILD_BACKEND) {
                        echo 'No changes in frontend or backend. Skipping builds.'
                    } else {
                        echo "Frontend build needed: ${env.BUILD_FRONTEND}"
                        echo "Backend build needed: ${env.BUILD_BACKEND}"
                    }
                }
            }
        }

        stage('Test Backend') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                container('maven') {
                    dir('spaceforces-back') {
                        withEnv(['SPRING_PROFILES_ACTIVE=test']) {
                            sh 'mvn test'
                        }
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('docker') {
                    sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                }
            }
        }

        stage('Build & Push Backend Image') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                container('docker') {
                    dir('spaceforces-back') {
                        sh "docker build -t ${DOCKER_REGISTRY}/spaceforces:backend-devops-${BACKEND_VERSION} ."
                        sh "docker push ${DOCKER_REGISTRY}/spaceforces:backend-devops-${BACKEND_VERSION}"
                    }
                }
            }
        }

        stage('Build & Push Frontend Image') {
            when {
                expression { env.BUILD_FRONTEND == 'true' }
            }
            steps {
                container('docker') {
                    dir('spaceforces-front') {
                        sh "docker build --memory=2g --memory-swap=4g --network=host -t ${DOCKER_REGISTRY}/spaceforces:frontend-devops-${FRONTEND_VERSION} ."
                            timeout(time: 5, unit: 'MINUTES') {
                                sh "docker push ${DOCKER_REGISTRY}/spaceforces:frontend-devops-${FRONTEND_VERSION}"
                            }
                    }
                }
            }
        }

        stage('Update Kubernetes Deployment') {
            when {
                anyOf {
                    expression { env.BUILD_FRONTEND == 'true' }
                    expression { env.BUILD_BACKEND == 'true' }
                }
            }
            steps {
                container('kubectl') {
                    script {
                        if (env.BUILD_BACKEND == 'true') {
                            sh "kubectl set image deployment/backend backend=${DOCKER_REGISTRY}/spaceforces:backend-devops-${BACKEND_VERSION} -n spaceforces"
                            sh 'kubectl rollout status deployment/backend -n spaceforces'
                        }

                        if (env.BUILD_FRONTEND == 'true') {
                            sh "kubectl set image deployment/frontend frontend=${DOCKER_REGISTRY}/spaceforces:frontend-devops-${FRONTEND_VERSION} -n spaceforces"
                            sh 'kubectl rollout status deployment/frontend -n spaceforces'
                        }
                    }
                }
            }
        }
    }

    // post {
    //     always {
    //         script {
    //             container('docker') {
    //                 sh 'docker logout'
    //             }
    //         }
    //         echo 'Pipeline finished.'
    //     }
    //     success {
    //         echo 'Pipeline succeeded!'
    //     }
    //     failure {
    //         echo 'Pipeline failed!'
    //     }
    // }
    post {
    always {
        node {
            container('docker') {
                sh 'docker logout'
            }
            echo 'Pipeline finished.'
        }
    }
    success {
        echo 'Pipeline succeeded!'
    }
    failure {
        echo 'Pipeline failed!'
    }
    }

}
