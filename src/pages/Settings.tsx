import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Database,
  Wrench,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { settingsService } from '../services/settingsService';

interface Setting {
  id: string;
  category: string;
  key: string;
  value: any;
  displayName: string;
  description: string;
  type: string;
  options?: string[] | null;
  isEditable: boolean;
  isVisible: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface SettingsFormData {
  [key: string]: any;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [formData, setFormData] = useState<SettingsFormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('system');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const categoryIcons = {
    system: Building,
    billing: CreditCard,
    notification: Bell,
    security: Shield,
    backup: Database,
    maintenance: Wrench
  };

  const categoryLabels = {
    system: 'System Settings',
    billing: 'Billing & Payments',
    notification: 'Notifications',
    security: 'Security',
    backup: 'Backup & Recovery',
    maintenance: 'Maintenance'
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAllSettings();
      setSettings(data);
      
      // Initialize form data with current values
      const initialFormData: SettingsFormData = {};
      data.forEach(setting => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Prepare updates for changed settings
      const updates = settings
        .filter(setting => formData[setting.key] !== setting.value)
        .map(setting => ({
          id: setting.id,
          value: formData[setting.key],
          modifiedBy: 'admin'
        }));

      if (updates.length > 0) {
        await settingsService.bulkUpdateSettings(updates);
        await loadSettings(); // Reload to get updated timestamps
        setHasChanges(false);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetCategory = async () => {
    const categorySettings = settings.filter(s => s.category === activeCategory);
    const resetFormData = { ...formData };
    
    categorySettings.forEach(setting => {
      resetFormData[setting.key] = setting.value;
    });
    
    setFormData(resetFormData);
    setHasChanges(false);
  };

  const renderSettingInput = (setting: Setting) => {
    const value = formData[setting.key];
    
    switch (setting.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={setting.type}
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={!setting.isEditable}
            className="max-w-md"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={!setting.isEditable}
            className="max-w-md"
            rows={3}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value) || 0)}
            disabled={!setting.isEditable}
            className="max-w-md"
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => handleInputChange(setting.key, checked)}
            disabled={!setting.isEditable}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleInputChange(setting.key, newValue)}
            disabled={!setting.isEditable}
          >
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={!setting.isEditable}
            className="max-w-md"
          />
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={!setting.isEditable}
            className="max-w-md"
          />
        );
    }
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = searchTerm === '' || 
      setting.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = setting.category === activeCategory;
    
    return matchesSearch && matchesCategory && setting.isVisible;
  });

  const categories = [...new Set(settings.map(s => s.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your hostel management system
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleResetCategory}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Changes
            </Button>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <Alert className={saveMessage.includes('Error') ? 'border-red-200' : 'border-green-200'}>
          {saveMessage.includes('Error') ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Unsaved changes
          </Badge>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || SettingsIcon;
            return (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(categoryIcons[category as keyof typeof categoryIcons] || SettingsIcon, { className: "h-5 w-5" })}
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </CardTitle>
                <CardDescription>
                  Configure {category} related settings for your hostel management system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {filteredSettings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No settings match your search.' : 'No settings available in this category.'}
                  </div>
                ) : (
                  filteredSettings.map((setting, index) => (
                    <div key={setting.id}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={setting.key} className="text-sm font-medium">
                            {setting.displayName}
                          </Label>
                          {!setting.isEditable && (
                            <Badge variant="secondary" className="text-xs">
                              Read Only
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                        <div className="pt-1">
                          {renderSettingInput(setting)}
                        </div>
                        {setting.lastModified && (
                          <p className="text-xs text-muted-foreground">
                            Last modified: {new Date(setting.lastModified).toLocaleString()} by {setting.modifiedBy}
                          </p>
                        )}
                      </div>
                      {index < filteredSettings.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Settings;