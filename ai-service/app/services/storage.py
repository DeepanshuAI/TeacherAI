"""S3-compatible object storage service (MinIO / AWS S3 / Cloudflare R2)."""

import structlog
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import settings

logger = structlog.get_logger(__name__)


class StorageService:
    """Abstracts S3-compatible object storage operations."""

    def __init__(self):
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version="s3v4"),
        )
        self._bucket = settings.S3_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        """Create bucket if it doesn't exist."""
        try:
            self._client.head_bucket(Bucket=self._bucket)
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                self._client.create_bucket(Bucket=self._bucket)
                logger.info("Created S3 bucket", bucket=self._bucket)

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        """Upload bytes to object storage. Returns the key."""
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        logger.info("File uploaded to storage", key=key, size=len(data))
        return key

    async def get_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a time-limited presigned URL for direct download."""
        url = self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=expires_in,
        )
        return url

    async def delete(self, key: str) -> None:
        """Delete an object from storage."""
        self._client.delete_object(Bucket=self._bucket, Key=key)
        logger.info("File deleted from storage", key=key)

    async def download(self, key: str) -> bytes:
        """Download an object and return its bytes."""
        response = self._client.get_object(Bucket=self._bucket, Key=key)
        return response["Body"].read()
