import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Play, Edit, Trash, Chrome, Link2, Link, Camera } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

const ScreenShotNode = ({ id, data }: NodeProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [fileName, setFileName] = useState(data.fileName || "");
  const [screenShotChoice, setScreenShotChoice] = useState(
    data.screenShotChoice || "A Page"
  );
  const [save, setSave] = useState(data.save || false);
  const [saveType, setSaveType] = useState(data.saveType || "PNG");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const handleSave = (newDescription: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, description: newDescription } }
          : node
      )
    );
    setIsDialogOpen(false);
  };

  return (
    <div className="relative min-w-[12rem] text-white p-3 rounded-xl shadow-md border border-gray-600 group bg-gray-900 transition-all hover:shadow-lg">
      {/* Action buttons, visible on hover */}
      <div className="absolute -top-[44px] left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-md p-2 flex justify-between items-center gap-x-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
        <Chrome
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          onClick={handleDelete}
        />
        <span className="border border-r-white h-[15px]"></span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Edit
              size={18}
              className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors"
              onClick={() => setIsDialogOpen(true)}
            />
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white rounded-lg shadow-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Edit ScreenShot
              </DialogTitle>
            </DialogHeader>
            <Label>Description</Label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="bg-gray-700 border-none text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />

            <Label>Take a screenshot of</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-transparent border border-gray-200 text-white hover:bg-transparent text-start">
                  {screenShotChoice}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={screenShotChoice}
                  onValueChange={setScreenShotChoice}
                >
                  <DropdownMenuRadioItem value="page">
                    A Page
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="fullPage">
                    A Full Page
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="element">
                    An Element
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Label>Screenshot type</Label>
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                placeholder="File Name"
                className="border border-white"
                disabled={!save}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="bg-transparent border border-gray-200 text-white hover:bg-transparent"
                    disabled={!save}
                  >
                    {saveType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={saveType}
                    onValueChange={setSaveType}
                  >
                    <DropdownMenuRadioItem value="PNG">
                      PNG
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="JPG">
                      JPEG
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                value={save}
                onClick={() => setSave(!save)}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Save screenshot to computer
              </Label>
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={() => handleSave(description)}
                className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <span className="border border-r-white h-[15px]"></span>
        <Trash
          size={18}
          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
          onClick={handleDelete}
        />
      </div>
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <span className="p-3 bg-black text-white rounded-lg shadow-md">
            <Camera size={20} />
          </span>
          <p className="text-sm font-semibold">Take ScreenShot</p>
        </div>

        {description && (
          <p className="text-xs text-gray-400 italic">{description}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "0.6rem", height: "0.6rem" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ backgroundColor: "white", width: "0.6rem", height: "0.6rem" }}
      />
    </div>
  );
};

export { ScreenShotNode };
