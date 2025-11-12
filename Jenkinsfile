pipeline {
    agent any

    environment {
        REGISTRY = 'masesaja'                       
        IMAGE_NAME = 'rz-dashboard'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/samesaja/rz-dashboard.git'
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t $REGISTRY/$IMAGE_NAME:latest .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'DOCKERHUB_PASS', usernameVariable: 'DOCKERHUB_USER')]) {
                    sh 'echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin'
                    sh 'docker push $REGISTRY/$IMAGE_NAME:latest'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                echo "Deploying to cluster..."
                kubectl apply -f k8s/deployment.yaml
                kubectl rollout status deployment/rz-dashboard
                '''
            }
        }
    }
}
