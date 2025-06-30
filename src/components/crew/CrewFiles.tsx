import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useCrewStore } from '@/store/useCrewStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  Save,
  Copy,
  Search,
  RefreshCw
} from 'lucide-react';

interface CrewFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  createdAt: Date;
  crewId: string;
  taskId?: string;
}

interface CrewFilesProps {
  crewId: string;
}

export const CrewFiles = forwardRef<any, CrewFilesProps>(({ crewId }, ref) => {
  const [files, setFiles] = useState<CrewFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CrewFile | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  const loadFiles = () => {
    const savedFiles = localStorage.getItem(`crew_files_${crewId}`);
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt)
      }));
      setFiles(parsedFiles);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [crewId]);

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshFiles: loadFiles
  }));

  const saveFiles = (updatedFiles: CrewFile[]) => {
    localStorage.setItem(`crew_files_${crewId}`, JSON.stringify(updatedFiles));
    setFiles(updatedFiles);
  };

  const createFile = (name: string, content: string, taskId?: string) => {
    const fileExtension = name.split('.').pop()?.toLowerCase() || 'txt';
    const fileType = getFileType(fileExtension);
    
    const newFile: CrewFile = {
      id: crypto.randomUUID(),
      name,
      content,
      type: fileType,
      size: new Blob([content]).size,
      createdAt: new Date(),
      crewId,
      taskId
    };

    const updatedFiles = [...files, newFile];
    saveFiles(updatedFiles);
    toast.success(`File "${name}" created successfully!`);
    return newFile;
  };

  const deleteFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    saveFiles(updatedFiles);
    toast.success('File deleted successfully!');
  };

  const downloadFile = (file: CrewFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded "${file.name}"`);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const getFileType = (extension: string): string => {
    const typeMap: Record<string, string> = {
      'txt': 'text',
      'md': 'markdown',
      'json': 'json',
      'csv': 'csv',
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'py': 'python',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'log': 'log'
    };
    return typeMap[extension] || 'text';
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    createFile(newFileName, newFileContent);
    setNewFileName('');
    setNewFileContent('');
    setIsCreateOpen(false);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const fileTypes = [...new Set(files.map(f => f.type))];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Crew Files ({files.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadFiles}
              className="h-8 px-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New File
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 gap-0">
                {/* Fixed Header */}
                <div className="p-6 border-b border-border">
                  <DialogHeader>
                    <DialogTitle>Create New File</DialogTitle>
                  </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">File Name</label>
                      <Input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="example.txt"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <Textarea
                        value={newFileContent}
                        onChange={(e) => setNewFileContent(e.target.value)}
                        placeholder="File content..."
                        className="min-h-[500px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 border-t border-border">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFile}>
                      <Save className="h-4 w-4 mr-2" />
                      Create File
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            <option value="all">All Types</option>
            {fileTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Files List - Scrollable */}
      <div className="flex-1 overflow-auto p-4">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {files.length === 0 ? 'No files yet' : 'No files match your search'}
            </p>
            <p className="text-sm">
              {files.length === 0 
                ? 'Files created by crew execution will appear here' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.createdAt.toLocaleDateString()} {file.createdAt.toLocaleTimeString()}</span>
                          {file.taskId && (
                            <>
                              <span>•</span>
                              <span className="text-blue-500">Task Generated</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(file);
                          setIsViewerOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(file.content)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0">
          {/* Fixed Header */}
          <div className="p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedFile?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedFile && (
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline">{selectedFile.type}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.createdAt.toLocaleString()}
                </span>
                {selectedFile.taskId && (
                  <Badge variant="secondary" className="text-xs">
                    Task Generated
                  </Badge>
                )}
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedFile.content)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(selectedFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
          
          {/* Scrollable Content */}
          {selectedFile && (
            <div className="flex-1 overflow-auto">
              <pre className="p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {selectedFile.content}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});