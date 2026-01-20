from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional, Literal
import re
import hashlib


class ValidationError(Exception):
    """Custom validation error for API responses."""
    pass


def is_meaningful_text(text: str, min_words: int = 3) -> bool:
    """Check if text contains meaningful words (not random characters)."""
    if not text:
        return False
    
    # Split into words
    words = text.split()
    if len(words) < min_words:
        return False
    
    # Common English words that indicate meaningful content
    common_words = {
        # Articles, pronouns, prepositions
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
        'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
        'from', 'up', 'about', 'into', 'over', 'after', 'and', 'but', 'or',
        'as', 'if', 'when', 'than', 'because', 'while', 'although', 'where',
        'that', 'which', 'who', 'whom', 'this', 'these', 'those', 'what',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
        'her', 'its', 'our', 'their', 'me', 'us', 'them', 'myself', 'yourself',
        # Common verbs
        'app', 'application', 'project', 'system', 'tool', 'platform', 'website',
        'mobile', 'web', 'software', 'user', 'users', 'data', 'using', 'create',
        'build', 'help', 'helps', 'allows', 'enables', 'provides', 'features',
        'based', 'use', 'new', 'get', 'got', 'make', 'made', 'take', 'took',
        'come', 'came', 'go', 'went', 'see', 'saw', 'know', 'knew', 'think',
        'thought', 'want', 'give', 'gave', 'find', 'found', 'tell', 'told',
        'ask', 'asked', 'work', 'works', 'working', 'seem', 'feel', 'try',
        'leave', 'call', 'called', 'keep', 'let', 'begin', 'began', 'show',
        'shown', 'hear', 'heard', 'play', 'run', 'move', 'live', 'believe',
        'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay',
        'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'led',
        'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read',
        'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'consider',
        'appear', 'buy', 'wait', 'serve', 'die', 'send', 'build', 'stay',
        'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass',
        'sell', 'require', 'report', 'decide', 'pull', 'develop', 'developed',
        # Common nouns
        'time', 'year', 'people', 'way', 'day', 'man', 'woman', 'child',
        'world', 'life', 'hand', 'part', 'place', 'case', 'week', 'company',
        'group', 'problem', 'fact', 'thing', 'service', 'services', 'point',
        'government', 'number', 'night', 'area', 'water', 'money', 'story',
        'word', 'business', 'issue', 'side', 'kind', 'head', 'house', 'friend',
        'father', 'power', 'hour', 'game', 'line', 'end', 'member', 'law',
        'car', 'city', 'community', 'name', 'team', 'minute', 'idea', 'body',
        'information', 'back', 'parent', 'face', 'others', 'level', 'office',
        'door', 'health', 'person', 'art', 'war', 'history', 'party', 'result',
        'change', 'morning', 'reason', 'research', 'moment', 'air', 'teacher',
        'force', 'education', 'foot', 'boy', 'age', 'policy', 'process',
        'music', 'market', 'sense', 'nation', 'plan', 'college', 'interest',
        'death', 'experience', 'effect', 'effort', 'view', 'job', 'model',
        'need', 'program', 'type', 'home', 'economy', 'picture', 'cost',
        'figure', 'action', 'industry', 'media', 'century', 'activity', 'road',
        'table', 'voice', 'car', 'security', 'hospital', 'church', 'method',
        'girl', 'period', 'value', 'rate', 'production', 'behavior', 'family',
        # Common adjectives
        'good', 'great', 'first', 'last', 'long', 'little', 'own', 'other',
        'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
        'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able',
        'best', 'better', 'sure', 'free', 'true', 'whole', 'real', 'possible',
        'full', 'special', 'easy', 'clear', 'recent', 'certain', 'personal',
        'open', 'red', 'difficult', 'available', 'likely', 'short', 'single',
        'medical', 'current', 'wrong', 'private', 'past', 'foreign', 'fine',
        'common', 'poor', 'natural', 'significant', 'similar', 'hot', 'dead',
        'central', 'happy', 'serious', 'ready', 'simple', 'left', 'physical',
        'general', 'environmental', 'financial', 'blue', 'democratic', 'dark',
        'various', 'entire', 'close', 'legal', 'religious', 'cold', 'final',
        'main', 'green', 'nice', 'huge', 'popular', 'traditional', 'cultural',
        # Common adverbs
        'not', 'also', 'very', 'often', 'however', 'too', 'usually', 'really',
        'early', 'never', 'always', 'sometimes', 'together', 'likely', 'simply',
        'generally', 'instead', 'actually', 'already', 'ever', 'now', 'again',
        'probably', 'once', 'quickly', 'especially', 'finally', 'specifically',
        'directly', 'recently', 'almost', 'certainly', 'exactly', 'perhaps',
        'yet', 'still', 'even', 'just', 'here', 'there', 'only', 'well',
        # Additional common terms
        'solution', 'solutions', 'feature', 'interface', 'design', 'support',
        'page', 'pages', 'content', 'form', 'forms', 'image', 'images', 'video',
        'videos', 'audio', 'file', 'files', 'document', 'documents', 'message',
        'messages', 'email', 'emails', 'search', 'filter', 'sort', 'list',
        'view', 'edit', 'delete', 'save', 'load', 'update', 'submit', 'upload',
        'download', 'share', 'like', 'comment', 'comments', 'post', 'posts',
        'profile', 'account', 'login', 'logout', 'register', 'signup', 'signin',
        'password', 'username', 'settings', 'option', 'options', 'menu', 'button',
        'link', 'links', 'navigation', 'dashboard', 'admin', 'panel', 'section',
        'category', 'categories', 'tag', 'tags', 'label', 'labels', 'status',
        'notification', 'notifications', 'alert', 'alerts', 'error', 'errors',
        'success', 'warning', 'info', 'debug', 'log', 'logs', 'report', 'reports',
        'analysis', 'analytics', 'metric', 'metrics', 'chart', 'charts', 'graph',
        'graphs', 'table', 'tables', 'row', 'rows', 'column', 'columns', 'cell',
        'track', 'tracking', 'monitor', 'monitoring', 'manage', 'management',
        'automate', 'automation', 'integrate', 'integration', 'connect', 'connection',
        'sync', 'synchronize', 'import', 'export', 'backup', 'restore', 'migrate',
        'deploy', 'deployment', 'release', 'version', 'versions', 'test', 'testing',
        'performance', 'optimize', 'optimization', 'scale', 'scaling', 'secure',
        'real', 'realtime', 'online', 'offline', 'local', 'remote', 'cloud',
        'server', 'client', 'frontend', 'backend', 'database', 'storage', 'cache',
        'queue', 'worker', 'job', 'jobs', 'task', 'tasks', 'scheduler', 'cron',
        'event', 'events', 'listener', 'handler', 'callback', 'hook', 'hooks',
        'plugin', 'plugins', 'module', 'modules', 'package', 'packages', 'library',
        'libraries', 'framework', 'frameworks', 'template', 'templates', 'theme',
        'themes', 'style', 'styles', 'layout', 'layouts', 'component', 'components',
        'widget', 'widgets', 'element', 'elements', 'object', 'objects', 'class',
        'classes', 'function', 'functions', 'method', 'methods', 'variable',
        'variables', 'constant', 'constants', 'parameter', 'parameters', 'argument',
        'arguments', 'return', 'value', 'values', 'input', 'output', 'stream',
        # Business/startup terms
        'startup', 'entrepreneur', 'investor', 'funding', 'revenue', 'profit',
        'customer', 'customers', 'client', 'clients', 'partner', 'partners',
        'vendor', 'vendors', 'supplier', 'suppliers', 'stakeholder', 'stakeholders',
        'strategy', 'strategic', 'goal', 'goals', 'objective', 'objectives',
        'target', 'targets', 'audience', 'segment', 'segments', 'market', 'markets',
        'competition', 'competitive', 'advantage', 'brand', 'branding', 'marketing',
        'sales', 'growth', 'scale', 'expand', 'expansion', 'launch', 'launched',
        'product', 'products', 'mvp', 'prototype', 'demo', 'pitch', 'hackathon'
    }
    
    # Known tech terms
    tech_terms = {
        # Programming languages
        'api', 'ui', 'ux', 'ai', 'ml', 'react', 'vue', 'angular', 'node',
        'python', 'java', 'javascript', 'typescript', 'css', 'html', 'sql',
        'nosql', 'mongodb', 'postgres', 'mysql', 'redis', 'docker', 'aws',
        'azure', 'gcp', 'firebase', 'flutter', 'swift', 'kotlin', 'rust',
        'go', 'php', 'ruby', 'django', 'flask', 'fastapi', 'express', 'next',
        'graphql', 'rest', 'http', 'https', 'json', 'xml', 'oauth', 'jwt',
        # Additional tech terms
        'npm', 'yarn', 'pip', 'maven', 'gradle', 'webpack', 'vite', 'babel',
        'eslint', 'prettier', 'jest', 'mocha', 'cypress', 'selenium', 'puppeteer',
        'git', 'github', 'gitlab', 'bitbucket', 'svn', 'cicd', 'jenkins', 'travis',
        'kubernetes', 'k8s', 'terraform', 'ansible', 'nginx', 'apache', 'linux',
        'ubuntu', 'debian', 'centos', 'windows', 'macos', 'ios', 'android',
        'tensorflow', 'pytorch', 'keras', 'scikit', 'pandas', 'numpy', 'scipy',
        'opencv', 'nlp', 'llm', 'gpt', 'bert', 'transformer', 'neural', 'network',
        'cnn', 'rnn', 'lstm', 'gan', 'reinforcement', 'supervised', 'unsupervised',
        'classification', 'regression', 'clustering', 'embedding', 'vector',
        'blockchain', 'ethereum', 'solidity', 'smart', 'contract', 'nft', 'defi',
        'crypto', 'cryptocurrency', 'bitcoin', 'wallet', 'web3', 'dapp', 'dao',
        'iot', 'mqtt', 'raspberry', 'arduino', 'sensor', 'sensors', 'actuator',
        'embedded', 'firmware', 'microcontroller', 'fpga', 'asic', 'hardware',
        'saas', 'paas', 'iaas', 'serverless', 'lambda', 'microservices', 'monolith',
        'devops', 'sre', 'agile', 'scrum', 'kanban', 'sprint', 'standup', 'retro',
        'crud', 'orm', 'mvc', 'mvvm', 'solid', 'dry', 'kiss', 'yagni', 'tdd', 'bdd',
        'ci', 'cd', 'qa', 'uat', 'staging', 'production', 'sandbox', 'environment',
        'ssl', 'tls', 'dns', 'cdn', 'vpc', 'subnet', 'firewall', 'proxy', 'vpn',
        'load', 'balancer', 'autoscaling', 'cluster', 'node', 'pod', 'container',
        'image', 'registry', 'repository', 'branch', 'merge', 'pull', 'push',
        'commit', 'tag', 'release', 'hotfix', 'bugfix', 'feature', 'refactor',
        'bootstrap', 'tailwind', 'material', 'antd', 'chakra', 'styled', 'sass',
        'less', 'postcss', 'responsive', 'adaptive', 'pwa', 'spa', 'ssr', 'ssg',
        'hydration', 'lazy', 'loading', 'infinite', 'scroll', 'pagination',
        'authentication', 'authorization', 'rbac', 'acl', 'sso', 'ldap', 'saml',
        'mfa', 'totp', 'biometric', 'fingerprint', 'facial', 'recognition',
        'encryption', 'decryption', 'hash', 'hashing', 'salt', 'bcrypt', 'argon',
        'aes', 'rsa', 'ecdsa', 'signature', 'certificate', 'pki', 'ca',
        'websocket', 'socket', 'polling', 'sse', 'webhook', 'pubsub', 'message',
        'broker', 'kafka', 'rabbitmq', 'sqs', 'sns', 'kinesis', 'eventbridge',
        'elasticsearch', 'solr', 'algolia', 'meilisearch', 'typesense', 'fulltext',
        's3', 'blob', 'bucket', 'cloudfront', 'cloudflare', 'akamai', 'fastly',
        'vercel', 'netlify', 'heroku', 'digitalocean', 'linode', 'vultr', 'render',
        'supabase', 'planetscale', 'neon', 'cockroach', 'timescale', 'influx',
        'prometheus', 'grafana', 'datadog', 'newrelic', 'splunk', 'elk', 'loki',
        'sentry', 'bugsnag', 'rollbar', 'logrocket', 'hotjar', 'mixpanel', 'amplitude',
        'segment', 'gtm', 'ga', 'google', 'facebook', 'twitter', 'linkedin', 'instagram',
        'tiktok', 'youtube', 'twitch', 'discord', 'slack', 'teams', 'zoom', 'meet',
        'stripe', 'paypal', 'braintree', 'square', 'adyen', 'checkout', 'payment',
        'subscription', 'billing', 'invoice', 'receipt', 'refund', 'chargeback',
        'twilio', 'sendgrid', 'mailchimp', 'mailgun', 'ses', 'sms', 'push', 'notification',
        'mapbox', 'leaflet', 'googlemaps', 'osm', 'geolocation', 'gps', 'geocoding',
        'ar', 'vr', 'xr', 'unity', 'unreal', 'threejs', 'webgl', 'webxr', 'arkit', 'arcore',
        'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'invision', 'zeplin',
        'jira', 'confluence', 'notion', 'asana', 'trello', 'monday', 'clickup', 'linear',
        'github', 'copilot', 'chatgpt', 'claude', 'gemini', 'anthropic', 'openai', 'cohere',
        'langchain', 'llamaindex', 'pinecone', 'weaviate', 'qdrant', 'chroma', 'faiss',
        'huggingface', 'replicate', 'stability', 'midjourney', 'dalle', 'diffusion'
    }
    
    recognized_words = 0
    for word in words:
        clean_word = re.sub(r'[^a-zA-Z]', '', word).lower()
        if clean_word in common_words or clean_word in tech_terms:
            recognized_words += 1
    
    # At least 30% of words should be recognized common/tech words
    return recognized_words >= len(words) * 0.3


class ProjectSubmission(BaseModel):
    """
    Project submission model with validation and sanitization.
    """
    title: str = Field(
        ..., 
        min_length=3, 
        max_length=200,
        description="Project title (3-200 characters)"
    )
    description: str = Field(
        ..., 
        min_length=20, 
        max_length=5000,
        description="Detailed project description (20-5000 characters)"
    )
    targetAudience: str = Field(
        default="", 
        max_length=300,
        description="Target audience for the project (optional, max 300 characters)"
    )
    techStack: str = Field(
        default="", 
        max_length=500,
        description="Technologies used (optional, max 500 characters)"
    )
    
    @field_validator('title', 'description', 'targetAudience', 'techStack')
    @classmethod
    def sanitize_input(cls, v: str) -> str:
        """Sanitize input to prevent prompt injection."""
        if not v:
            return v
        
        # Remove potential prompt injection patterns
        # Remove excessive whitespace
        v = ' '.join(v.split())
        
        # Remove control characters (except newlines in description)
        v = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', v)
        
        # Escape potential delimiter attacks
        dangerous_patterns = [
            '```', '---', '===', '###', 
            'IGNORE PREVIOUS', 'IGNORE ABOVE',
            'SYSTEM:', 'USER:', 'ASSISTANT:',
            '<|', '|>', '[[', ']]'
        ]
        for pattern in dangerous_patterns:
            v = v.replace(pattern, '')
        
        return v.strip()
    
    def get_cache_key(self) -> str:
        """Generate a unique cache key for this submission."""
        content = f"{self.title}|{self.description}|{self.techStack}"
        return hashlib.sha256(content.encode()).hexdigest()[:32]
    
    @model_validator(mode='after')
    def validate_meaningful_content(self):
        """Ensure the submission contains meaningful, coherent content."""
        # For title: just check it's not pure keyboard mashing (has proper word structure)
        title_words = self.title.split()
        gibberish_patterns = ['asdf', 'qwerty', 'zxcv', 'hjkl', 'yuiop', 'bnm', 'fgh', 'jkl']
        title_lower = self.title.lower()
        is_gibberish_title = any(pattern in title_lower for pattern in gibberish_patterns)
        
        if is_gibberish_title or (len(title_words) == 1 and not any(c in 'aeiouAEIOU' for c in self.title)):
            raise ValueError(
                "Please provide a valid project title. "
                "Random characters or gibberish are not accepted."
            )
        
        # Check description is meaningful (requires recognizable words)
        if not is_meaningful_text(self.description, min_words=5):
            raise ValueError(
                "Please provide a meaningful project description with at least 5 words. "
                "Describe what your project does, the problem it solves, and key features."
            )
        
        return self
    
    def get_safe_prompt_content(self) -> dict:
        """Get sanitized content safe for prompt injection."""
        return {
            "title": self.title[:200],  # Extra truncation for safety
            "description": self.description[:3000],
            "targetAudience": self.targetAudience[:300],
            "techStack": self.techStack[:300]
        }


class CategoryScore(BaseModel):
    """Score for a specific evaluation category."""
    name: str = Field(..., min_length=1, max_length=100)
    score: float = Field(..., ge=0, le=100, description="Score from 0-100")
    feedback: str = Field(default="", max_length=1000)
    
    @field_validator('score')
    @classmethod
    def round_score(cls, v: float) -> float:
        """Round score to 1 decimal place."""
        return round(v, 1)


class Suggestion(BaseModel):
    """Improvement suggestion from mentor agent."""
    area: str = Field(..., min_length=1, max_length=100)
    advice: str = Field(..., min_length=1, max_length=1000)
    difficulty: Literal["Low", "Medium", "High"] = Field(
        default="Medium",
        description="Implementation difficulty level"
    )


class EvaluationResult(BaseModel):
    """
    Complete evaluation result from all AI agents.
    """
    overallScore: float = Field(..., ge=0, le=100, description="Overall score 0-100")
    prediction: Literal["Acceptance", "Rejection", "Unknown"] = Field(
        default="Unknown",
        description="Predicted hackathon outcome"
    )
    probability: float = Field(..., ge=0, le=1, description="Confidence probability 0-1")
    critique: str = Field(..., min_length=1, max_length=2000)
    judgePersona: str = Field(default="The Judge", max_length=100)
    categories: List[CategoryScore] = Field(default_factory=list)
    suggestions: List[Suggestion] = Field(default_factory=list)
    benchmarkComparison: Optional[str] = Field(default=None, max_length=2000)
    error: Optional[str] = Field(default=None, description="Error message if evaluation failed")
    
    @field_validator('overallScore')
    @classmethod
    def round_overall_score(cls, v: float) -> float:
        """Round overall score to nearest integer."""
        return round(v)
    
    @field_validator('probability')
    @classmethod
    def round_probability(cls, v: float) -> float:
        """Round probability to 2 decimal places."""
        return round(v, 2)
