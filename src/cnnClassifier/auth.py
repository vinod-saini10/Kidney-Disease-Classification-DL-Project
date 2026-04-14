import random
import string
import os
from flask_mail import Mail, Message
from flask import current_app

mail = Mail()

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(email, otp):
    # Always print OTP to terminal for development/debugging
    print(f"\n>>> [DEBUG] Verification Code for {email}: {otp} <<<\n")

    if not os.getenv('MAIL_USERNAME') or os.getenv('MAIL_USERNAME') == 'vinod.saini24@pcu.edu.in':
        print(f"\n[SIMULATION] Sending OTP {otp} to {email}\n")
        return True
    
    try:
        msg = Message(
            'Your Kidney Disease Classification OTP',
            sender=os.getenv('MAIL_USERNAME'),
            recipients=[email]
        )
        msg.body = f'Your verification code is: {otp}'
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
