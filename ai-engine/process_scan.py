import sys
import json
import requests
from analyze_vulnerability import VulnerabilityAnalyzer

def process_scan_with_ai(scan_id):
    analyzer = VulnerabilityAnalyzer()
    
    api_url = 'http://localhost:5000/api/scans'
    
    try:
        response = requests.get(f'{api_url}/{scan_id}')
        scan = response.json()
        
        print(f'Processing scan: {scan_id}')
        print(f'Found {len(scan["vulnerabilities"])} vulnerabilities')
        
        for vuln in scan['vulnerabilities']:
            ai_analysis = analyzer.analyze(vuln)
            vuln['aiAnalysis'] = ai_analysis
            
            print(f'\nVulnerability: {vuln["title"]}')
            print(f'AI Priority Score: {ai_analysis["priorityScore"]}/100')
            print(f'Risk Level: {ai_analysis["riskLevel"]}')
            print(f'Suggested Fix: {ai_analysis["suggestedFix"]}')
        
        update_response = requests.put(f'{api_url}/{scan_id}', json=scan)
        
        if update_response.status_code == 200:
            print(f'\nSuccessfully updated scan with AI analysis')
        else:
            print(f'\nFailed to update scan')
            
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        scan_id = sys.argv[1]
    else:
        scan_id = 'test-001'
    
    process_scan_with_ai(scan_id)
