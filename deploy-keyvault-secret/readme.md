# Captain's Blog Supplemental

These files are part of an [article I wrote for my blog](https://jonathanpeterson.com/posts/unlocking-azure-key-vault-secret-deployment.html).

## One Step
I mentioned in the blog post that I found that I could actually all the steps one on go. 
The `deploy-one-step` and `template-one-step` is the result of those findings. These files will deploy the App Service Plan, the App Service, the Key Vault and the secret without any additional pipeline steps.

If you already have an existing Key Vault that you want to deploy secrets then check out `deploy.yaml` instead and ignore the bicep deployment step.
