import React, { useState, useEffect, useCallback } from 'react';
import { ThemeBackup, Store } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { History, PlusCircle, Trash2, Download, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ThemeBackups() {
  const [store, setStore] = useState(null);
  const [backups, setBackups] = useState([]);
  const [newBackupNotes, setNewBackupNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const stores = await Store.filter({ created_by: user.email });
      if (stores.length > 0) {
        const currentStore = stores[0];
        setStore(currentStore);
        const backupList = await ThemeBackup.filter({ store_id: currentStore.id }, '-created_date');
        setBackups(backupList);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load backup data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBackup = async () => {
    if (!store) return;
    
    try {
      const latestVersion = backups.length > 0 ? Math.max(...backups.map(b => b.version)) : 0;
      
      await ThemeBackup.create({
        store_id: store.id,
        theme_id: store.theme_id || 'live',
        theme_name: 'Live Theme', // In a real scenario, this would be fetched via API
        notes: newBackupNotes,
        version: latestVersion + 1,
      });
      setNewBackupNotes("");
      toast.success("Theme backup created successfully!");
      loadData();
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup.");
    }
  };

  const handleDeleteBackup = async (id) => {
    try {
      await ThemeBackup.delete(id);
      toast.success("Backup deleted successfully.");
      loadData();
    } catch (error) {
      console.error("Error deleting backup:", error);
      toast.error("Failed to delete backup.");
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <History className="w-8 h-8 text-gray-400" />
            Theme Code Auto-Backup System
          </h1>
          <p className="text-gray-400 mt-2">
            Manage and restore your theme versions before and after optimizations.
          </p>
        </motion.div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create New Backup</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Input
              value={newBackupNotes}
              onChange={(e) => setNewBackupNotes(e.target.value)}
              placeholder="Add notes for this backup (e.g., 'Before image optimization')"
              className="bg-gray-800 border-gray-700 flex-grow"
            />
            <Button onClick={handleCreateBackup} className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Backup
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader><CardTitle className="text-white">Backup History</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-400">Loading backups...</p>
            ) : backups.length > 0 ? (
              <div className="space-y-4">
                {backups.map(backup => (
                  <motion.div 
                    key={backup.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-white">Version {backup.version}</h4>
                      <p className="text-sm text-gray-400">{new Date(backup.created_date).toLocaleString()}</p>
                      {backup.notes && <p className="text-sm text-gray-300 mt-1 italic">"{backup.notes}"</p>}
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <Button variant="outline" disabled className="cursor-not-allowed border-gray-700 text-gray-400">
                        Restore
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this backup record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBackup(backup.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <History className="w-16 h-16 mx-auto mb-4" />
                <p>No backups found. Create your first backup to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}