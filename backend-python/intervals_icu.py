"""
Intervals.icu API Client
Handles communication with Intervals.icu API for fetching wellness and activity data
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class IntervalsICUClient:
    """Client for Intervals.icu API"""
    
    BASE_URL = "https://intervals.icu/api/v1"
    
    def __init__(self, api_key: str):
        """
        Initialize the Intervals.icu client
        
        Args:
            api_key: User's Intervals.icu API key (format: API_KEY:athlete_id)
        """
        self.api_key = api_key
        self.session = requests.Session()
        
        # Parse API key to get athlete ID
        if ':' in api_key:
            key_part, athlete_id = api_key.split(':', 1)
            self.athlete_id = athlete_id
            self.session.auth = (key_part, '')
        else:
            # Try using the key as is
            self.athlete_id = None
            self.session.auth = (api_key, '')
    
    def test_connection(self) -> bool:
        """
        Test the API connection
        
        Returns:
            bool: True if connection is successful
        """
        try:
            response = self.session.get(f"{self.BASE_URL}/athlete")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False
    
    def get_athlete_info(self) -> Optional[Dict[str, Any]]:
        """Get athlete information"""
        try:
            response = self.session.get(f"{self.BASE_URL}/athlete")
            response.raise_for_status()
            data = response.json()
            if not self.athlete_id and 'id' in data:
                self.athlete_id = str(data['id'])
            return data
        except Exception as e:
            logger.error(f"Failed to get athlete info: {e}")
            return None
    
    def get_activities(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """
        Fetch activities with RPE and Feel data
        
        Args:
            start_date: Start date for activities
            end_date: End date for activities
            
        Returns:
            List of activity dictionaries
        """
        if not self.athlete_id:
            self.get_athlete_info()
        
        if not self.athlete_id:
            logger.error("Athlete ID not available")
            return []
        
        try:
            # Format dates
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')
            
            url = f"{self.BASE_URL}/athlete/{self.athlete_id}/activities"
            params = {
                'oldest': start_str,
                'newest': end_str
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            activities = response.json()
            
            # Parse and return relevant data
            result = []
            for activity in activities:
                result.append({
                    'activity_id': str(activity.get('id')),
                    'activity_date': activity.get('start_date_local', '').split('T')[0],
                    'activity_name': activity.get('name', ''),
                    'activity_type': activity.get('type', ''),
                    'rpe': activity.get('icu_rpe'),
                    'feel': activity.get('feel'),
                    'duration': activity.get('moving_time'),
                    'distance': activity.get('distance'),
                    'power_data': {
                        'avg_power': activity.get('average_watts'),
                        'max_power': activity.get('max_watts'),
                        'normalized_power': activity.get('weighted_average_watts'),
                        'work': activity.get('total_work')
                    },
                    'hr_data': {
                        'avg_hr': activity.get('average_heartrate'),
                        'max_hr': activity.get('max_heartrate')
                    }
                })
            
            return result
        except Exception as e:
            logger.error(f"Failed to get activities: {e}")
            return []
    
    def get_wellness_data(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """
        Fetch wellness metrics (HRV, weight, sleep, etc.)
        
        Args:
            start_date: Start date for wellness data
            end_date: End date for wellness data
            
        Returns:
            List of wellness metric dictionaries
        """
        if not self.athlete_id:
            self.get_athlete_info()
        
        if not self.athlete_id:
            logger.error("Athlete ID not available")
            return []
        
        try:
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')
            
            url = f"{self.BASE_URL}/athlete/{self.athlete_id}/wellness"
            params = {
                'oldest': start_str,
                'newest': end_str
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            wellness_data = response.json()
            
            # Parse and return relevant data
            result = []
            for entry in wellness_data:
                result.append({
                    'metric_date': entry.get('id'),  # Date is the ID
                    'hrv': entry.get('hrvRMSSD'),
                    'resting_hr': entry.get('restingHR'),
                    'weight': entry.get('weight'),
                    'sleep_seconds': entry.get('sleepSecs'),
                    'sleep_quality': entry.get('sleepQuality'),
                    'fatigue': entry.get('fatigue'),
                    'mood': entry.get('mood'),
                    'stress': entry.get('stress'),
                    'soreness': entry.get('soreness'),
                    'menstruation': entry.get('menstruation', False)
                })
            
            return result
        except Exception as e:
            logger.error(f"Failed to get wellness data: {e}")
            return []
    
    def get_activity_streams(self, activity_id: str) -> Dict[str, Any]:
        """
        Fetch detailed activity streams (power, HR, cadence, etc.)
        
        Args:
            activity_id: Intervals.icu activity ID
            
        Returns:
            Dictionary with stream data
        """
        if not self.athlete_id:
            self.get_athlete_info()
        
        if not self.athlete_id:
            logger.error("Athlete ID not available")
            return {}
        
        try:
            url = f"{self.BASE_URL}/athlete/{self.athlete_id}/activities/{activity_id}/streams"
            response = self.session.get(url)
            response.raise_for_status()
            streams = response.json()
            
            return {
                'watts': streams.get('watts', []),
                'heartrate': streams.get('heartrate', []),
                'cadence': streams.get('cadence', []),
                'altitude': streams.get('altitude', []),
                'time': streams.get('time', [])
            }
        except Exception as e:
            logger.error(f"Failed to get activity streams: {e}")
            return {}


def decrypt_api_key(encrypted_key: str) -> str:
    """
    Decrypt an encrypted API key
    
    Args:
        encrypted_key: Encrypted API key string
        
    Returns:
        Decrypted API key
    """
    # TODO: Implement proper encryption/decryption using Fernet
    # For now, return as-is (NOT SECURE FOR PRODUCTION)
    return encrypted_key


def encrypt_api_key(api_key: str) -> str:
    """
    Encrypt an API key for storage
    
    Args:
        api_key: Plain API key string
        
    Returns:
        Encrypted API key
    """
    # TODO: Implement proper encryption using Fernet
    # For now, return as-is (NOT SECURE FOR PRODUCTION)
    return api_key
